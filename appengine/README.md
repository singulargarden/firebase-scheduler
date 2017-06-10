# Scheduler App Engine

Waken up by Google App Engine Cron system, trigger items scheduled in firebase.

REQUIRE A `firebase-admin-key.json` that you get from your firebase console:
https://console.firebase.google.com/project/PROJECT-NAME/settings/serviceaccounts/adminsdk

put it in the root of the `appengine/` module.

- `gcloud app deploy`
- `gcloud app deploy cron.yaml`

- local dev: `DEV=true npm start`