# Scheduler App Engine

Relies on Google App Engine Cron to trigger scheduled events in firebase.

## Config:

- `firebase-admin-key.json`, that you get from your firebase console:
    https://console.firebase.google.com/project/PROJECT-NAME/settings/serviceaccounts/adminsdk
- `config.json`, copy the `config.json.example` and set your own values
- `cron.yaml`, copy the `cron.yaml.example` and set your own values

## Deploy:

In the root of the `appengine/` folder:

- `gcloud app deploy`
- `gcloud app deploy cron.yaml`

## Dev:

- `DEV=true npm start`