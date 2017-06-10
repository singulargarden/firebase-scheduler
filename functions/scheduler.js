const numbers = require('./numbers')

function now() {
  return new Date().getTime()
}

function scheduleTime(conf) {
  return conf.time.seconds * 1000 + now()
}

function schedule(firebase, conf) {
  const t = scheduleTime(conf)
  conf.time.scheduledTS = t

  const scheduler = conf.scheduler
  const key = numbers.generateID(t)

  const newItem = {}
  newItem['/all/' + key] = conf
  newItem['/pending/' + key] = true

  return firebase.database()
    .ref('/scheduler/' + scheduler)
    .update(newItem)
}

module.exports.now = now
module.exports.schedule = schedule
