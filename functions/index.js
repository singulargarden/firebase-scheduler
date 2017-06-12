/**
 * Demo the firebase-scheduler with appengine.
 *
 * Imagine a chatbot that you can ask to "bleep" you in x seconds.
 * If x is in the order of minutes, hours or days, you can't have the execution occurs in a single function.
 * You go through this scheduling system.
 *
 * the bleep endpoint will schedule a bleep operation,
 * doBleep is the actual execution,
 * showBleep give your statistics on the execution.
 */
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const scheduler = require('firebase-scheduler')
const url = require('url')

const schedule = scheduler.schedule
const firebase = admin.initializeApp(functions.config().firebase)

/**
 * Retrieve the URL for another endpoint running on the same server, on https.
 *
 * @param req The express/firebase function request object
 * @param newPath The endpoint
 * @returns {string} The URL
 */
function reqURL(req, newPath) {
  return url.format({
    protocol: 'https', //req.protocol, // by default this returns http which gets redirected
    host: req.get('host'),
    pathname: newPath
  })
}

/**
 * Run the bleep
 * @type {HttpsFunction}
 */
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

/**
 * Show the last bleep
 * @type {HttpsFunction}
 */
exports.showBleep = functions.https.onRequest((request, response) =>
  firebase.database().ref('/bleep/').once('value')
    .then(x => response.send(JSON.stringify(x.val() || {})).status(200).end())
)

/**
 * Schedule a bleep
 * @type {HttpsFunction}
 */
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

