/**
 * the firebase-scheduler module.
 *
 * Use schedule(firebase, item) to schedule an item to be processed later.
 *
 * item = {
 *  scheduler: "the-scheduler-name",
 *  time: { seconds: (number of seconds from now) },
 *  query: (the parameter to pass to the `request` library)
 * }
 */
const numbers = require('./numbers')

function now() {
  return new Date().getTime()
}

function scheduleTime(conf) {
  return conf.time.seconds * 1000 + now()
}

function schedule(firebase, item) {
  const t = scheduleTime(item)
  item.time.scheduledTS = t
  item.pending = true

  const scheduler = item.scheduler
  const key = numbers.generateID(t)

  const newItem = {}
  newItem['/all/' + key] = item
  newItem['/pending/' + key] = true

  return firebase.database()
    .ref('/scheduler/' + scheduler)
    .update(newItem)
    .then(() => key)
}


function pendings(firebase, scheduler_id, maxDeltaSeconds) {
  const time = now() + 1 + maxDeltaSeconds * 1000
  const key = numbers.generateID(time, true)

  console.log(`Retrieving all pending jobs for ${scheduler_id} up to time: ${time}, key: ${key}`)

  return firebase.database()
    .ref(`/scheduler/${scheduler_id}/pending`)
    .orderByKey()
    .endAt(key)
    .once('value')
}

function complete(firebase, scheduler_id, item_id) {
  const updates = {}
  updates[`/all/${item_id}/pending`] = false
  updates[`/pending/${item_id}`] = null

  return firebase.database()
    .ref(`/scheduler/${scheduler_id}`)
    .update(updates)
}

function get(firebase, scheduler_id, item_id) {
  return firebase.database()
    .ref(`/scheduler/${scheduler_id}/all/${item_id}`)
    .once('value')
    .then(x => x.val())
}

function cancel(firebase, scheduler_id, item_id) {
  const updates = {}
  updates[`/all/${item_id}/pending`] = false
  updates[`/all/${item_id}/canceled`] = true
  updates[`/pending/${item_id}`] = null

  return firebase.database()
    .ref(`/scheduler/${scheduler_id}`)
    .update(updates)
}

module.exports.now = now
module.exports.schedule = schedule
module.exports.complete = complete
module.exports.pendings = pendings
module.exports.get = get
module.exports.cancel = cancel

module.exports.scheduleID = numbers.generateID
