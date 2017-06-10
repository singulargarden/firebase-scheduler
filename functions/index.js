const functions = require('firebase-functions')
const admin = require('firebase-admin')
const url = require('url')
const scheduler = require('./scheduler')

const schedule = scheduler.schedule
const firebase = admin.initializeApp(functions.config().firebase)

function reqURL(req, newPath) {
  return url.format({
    protocol: 'https', //req.protocol, // by default this returns http which gets redirected
    host: req.get('host'),
    pathname: newPath
  })
}

exports.doBleep = functions.https.onRequest((request, response) => {
  const bleepRef = firebase.database().ref('/bleep/')
  const newBleepKey = bleepRef.child('all').push().key
  const now = scheduler.now()

  const updates = {}
  updates['/all/' + newBleepKey] = { call: now }
  updates['/lastCall'] = now

  bleepRef.update(updates)
    .then(() => response.send('OK').status(200).end())
})

exports.showBleep = functions.https.onRequest((request, response) =>
  firebase.database().ref('/bleep/').once('value')
    .then(x => response.send(JSON.stringify(x.val() || {})).status(200).end())
)

exports.bleep = functions.https.onRequest((request, response) =>
  schedule(firebase, {
    scheduler: request.query.scheduler || 'bleeper',
    time: { seconds: request.query.seconds || 5 },
    query: {
      method: 'POST',
      uri: reqURL(request, '/doBleep'),
      body: 'blooop'
    },
  }).then(() => response.send('bloop').status(200).end())
)

exports.longBleep = functions.https.onRequest((request, response) =>
  schedule(firebase, {
    scheduler: request.query.scheduler || 'bleeper',
    time: { seconds: request.query.seconds || 60 },
    query: {
      method: 'POST',
      uri: reqURL(request, '/doBleep'),
      body: 'blooooop'
    },
  }).then(() => response.send('bloop').status(200).end())
)

exports.veryLongBleep = functions.https.onRequest((request, response) =>
  schedule(firebase, {
    scheduler: request.query.scheduler || 'bleeper',
    time: { seconds: request.query.seconds || 300 },
    query: {
      method: 'POST',
      uri: reqURL(request, '/doBleep'),
      body: 'bloooooooooop'
    },
  }).then(() => response.send('bloop').status(200).end())
)
