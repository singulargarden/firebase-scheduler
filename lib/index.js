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

  const scheduler = item.scheduler
  const key = numbers.generateID(t)

  const newItem = {}
  newItem['/all/' + key] = item
  newItem['/pending/' + key] = true

  return firebase.database()
    .ref('/scheduler/' + scheduler)
    .update(newItem)
}

module.exports.now = now
module.exports.schedule = schedule
