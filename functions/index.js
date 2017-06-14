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
const url = require('url')
const admin = require('firebase-admin')
const functions = require('firebase-functions')
const scheduler = require('firebase-scheduler')

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
 */
exports.showBleep = functions.https.onRequest((request, response) =>
  firebase.database().ref('/bleep/').once('value')
    .then(x => response.send(JSON.stringify(x.val() || {})).status(200).end())
)

/**
 * Schedule a bleep
 */
exports.bleep = functions.https.onRequest((request, response) =>
  scheduler.schedule(firebase, {
    scheduler: request.query.scheduler || 'bleeper',
    time: { seconds: request.query.seconds || 5 },
    query: {
      method: 'POST',
      uri: reqURL(request, '/doBleep'),
      body: 'bloop'
    },
  }).then(x => response.status(200).json({ id: x }))
)

/**
 * Access a bleep
 */
exports.get = functions.https.onRequest((request, response) => {
  scheduler.get(firebase,
    request.query.scheduler || 'bleeper',
    request.query.item_id
  ).then(x => {
    if (x && x.pending) {
      return response.status(200).json(x)
    }
    return response.status(404).json({ error: 'not-found' })
  })
})

/**
 * Cancel a bleep
 */
exports.cancel = functions.https.onRequest((request, response) =>
  scheduler.cancel(firebase,
    request.query.scheduler || 'bleeper',
    request.query.item_id
  ).then(x => response.status(200).json({ success: 'canceled' }))
)
