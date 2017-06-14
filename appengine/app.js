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

function makeResponse(res, id, processed) {
  res.status(200)
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({ scheduler: id, lastRun: 0, processedCount: processed.length }))
  return res
}
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


// Process Requests
// ----------------

const app = express()


app.get('/', (req, res) => {
  res.status(200).send('Hello, World!').end()
})

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
    .then(() => scheduler.complete(admin, id, key))
}

app.get('/check/:duration/:id', (req, res) => {
  // Allowed only from a cron job or in developement mode.
  if (!isDev && req.get('X-Appengine-Cron') !== 'true') {
    res.status(403)
    res.send('Forbidden')
    return res
  }

  const duration = parseInt(req.params['duration'])
  const id = req.params['id']

  scheduler.pendings(admin, id, duration)
    .then(dataSnapshot => {
      const r = []
      console.log(`Scheduling ${dataSnapshot.numChildren()} items`)
      dataSnapshot.forEach(x => r.push(processScheduled(id, x.key, x.val())) && false)
      return Promise.all(r)
    })
    .then(xs => makeResponse(res, id, xs))
    .catch(x => res.send({ error: 'failed', from: x }).status(500).end())
})


// Start the server
// ----------------

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`)
  console.log('Press Ctrl+C to quit.')
})
