# firebase-scheduler

:bomb: Not ready for prime-time yet! Use the Watch button above to track the updates & releases!


What if you want a function to continue in 5 minutes? Or check something tomorrow?
What if you want a chatbot to remind your user they haven't completed something in 2 hours?

`firebase-scheduler` let's you schedule queries in the futures.

It's:
- `functions/`: the code that schedule jobs in the future, let's you cancel them, etc.
- `appengine/`: the google app engine job that'll manage your scheduled functions
- `remindme/`: a demo application.

Works for only-once function for now, should be easy to turn this into a cron-job if you need it,
reach out to us!
