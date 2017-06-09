'use strict'

const express = require('express')
const admin = require('firebase-admin')

// Prepare Firebase
// ----------------

const serviceAccount = require('./firebase-admin-key.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://singulardemo-1.firebaseio.com'
})


// Process Requests
// ----------------

const app = express()


app.get('/', (req, res) => {
  res.status(200).send('Hello, World!').end()
})

function processScheduled(item) {
  return 1
}

app.get('/check/:id', (req, res) => {
  const id = req.params['id']

  admin.database().ref(`/scheduler/${id}/pending`).once('value')
    .then((dataSnapshot) => {
      const r = []
      dataSnapshot.forEach((x) => r.push(processScheduled(x)))
      return Promise.all(r)
    })
    .then((xs) => res.status(200).send(`done processing ${id}, ${xs.length} items`).end())
})


// Start the server
// ----------------

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`)
  console.log('Press Ctrl+C to quit.')
})
