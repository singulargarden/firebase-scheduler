const functions = require('firebase-functions')
const admin = require('firebase-admin')
const scheduler = require('./scheduler')

const schedule = scheduler.schedule
const firebase = admin.initializeApp(functions.config().firebase)

exports.doBleep = functions.https.onRequest((request, response) => {
  console.log('BLEEP')
  return response.send('OK').status(200).send()
})

exports.bleep = functions.https.onRequest((request, response) =>
  schedule(firebase, {
    scheduler: 'bleeper',
    time: { seconds: 5 },
    query: { verb: 'POST', url: 'https://us-central1-singulardemo-1.cloudfunctions.net/doBleep' },
    payload: 'blooo'
  }).then(() => response.send('bloop').status(200).end())
)

exports.longBleep = functions.https.onRequest((request, response) =>
  schedule(firebase, {
    scheduler: 'bleeper',
    time: { seconds: 60 },
    query: { verb: 'POST', url: 'https://us-central1-singulardemo-1.cloudfunctions.net/doBleep' },
    payload: 'bloooooop'
  }).then(() => response.send('bloop').status(200).end())
)

exports.veryLongBleep = functions.https.onRequest((request, response) =>
  schedule(firebase, {
    scheduler: 'bleeper',
    time: { seconds: 300 },
    query: { verb: 'POST', url: 'https://us-central1-singulardemo-1.cloudfunctions.net/doBleep' },
    payload: 'bloooooooooop'
  }).then(() => response.send('bloop').status(200).end())
)
