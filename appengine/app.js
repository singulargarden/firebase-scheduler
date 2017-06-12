'use strict'

const express = require('express')
const admin = require('firebase-admin')
const util = require('util')
const request = require('request-promise')
const scheduler = require('firebase-scheduler')


// Prepare Firebase
// ----------------

const serviceAccount = require('./firebase-admin-key.json')
const config = require('./config.json')

const isDev = process.env.DEV == 'true'

console.log(`DEV MODE=${isDev}`)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.databaseURL
})

function now() {
  return (new Date()).getTime()
}

// Process Requests
// ----------------

const app = express()


app.get('/', (req, res) => {
  res.status(200).send('Hello, World!').end()
})

function promiseDelay(ms, x) {
  return new Promise(function (resolve) {
    if (ms > 0) {
      setTimeout(function () {
        resolve(x)
      }, ms)
    }
    else {
      // Immediate
      resolve(x)
    }
  })
}

function processScheduled(id, key, value) {
  console.log(`Processing item={id: ${id}, key: ${key}, value: ${util.inspect(value)}}`)

  // Get the scheduled item payload,
  // then execute the query
  // then remove remove it from the list of pending items.
  return admin.database().ref(`/scheduler/${id}/all/${key}`).once('value')
    .then(x => x.val())
    .then(x => {
      const delta = x.time.scheduledTS - now()
      console.log(`Waiting for item: ${id}, delta: ${delta}`)
      return promiseDelay(delta, x)
    })
    .then(x => {
      console.log(`Running item: ${id}, query: ${util.inspect(x.query)}`)
      return request(x.query)
    })
    .then(() =>
      admin.database().ref(`/scheduler/${id}/pending/${key}`).remove()
    )
}

function makeResponse(res, id, processed) {
  res.status(200)
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({ scheduler: id, lastRun: 0, processedCount: processed.length }))
  return res
}

function pendings(schedulerRef, maxDeltaSeconds) {
  const time = now() + 1 + maxDeltaSeconds * 1000
  const key = scheduler.scheduleID(time, true)

  console.log(`Retrieving all pending jobs up to time: ${time}, key: ${key}`)

  return schedulerRef
    .orderByKey()
    .endAt(key)
    .once('value')
}

app.get('/check/:duration/:id', (req, res) => {

  // Allowed only from a cron job or in developement mode.
  if (!isDev && req.get('X-Appengine-Cron') != true) {
    res.status(403)
    res.send('Forbidden')
    return res
  }

  const duration = parseInt(req.params['duration'])
  const id = req.params['id']

  const schedulerRef = admin.database().ref(`/scheduler/${id}/pending`)

  pendings(schedulerRef, duration)
    .then(dataSnapshot => {
      const r = []
      console.log(`Scheduling ${dataSnapshot.numChildren()} items`)
      dataSnapshot.forEach(x => r.push(processScheduled(id, x.key, x.val())) && false)
      return Promise.all(r)
    })
    .then(xs => makeResponse(res, id, xs))
    .catch(x => res.send(x).status(500).end())
})


// Start the server
// ----------------

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`)
  console.log('Press Ctrl+C to quit.')
})
