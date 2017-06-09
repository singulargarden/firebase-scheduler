const numbers = require('./numbers')

function now() {
  return new Date().getTime()
}

function scheduleTime(conf) {
  const time = conf.time
  const now = now()

  return time.seconds * 1000 + now
}

function schedule(firebase, conf) {
  const scheduler = conf.scheduler
  const key = numbers.generateID(scheduleTime(conf))

  return firebase.database()
    .ref('/scheduler/' + scheduler + '/pending/' + key)
    .set(conf)
}

module.exports.schedule = schedule
