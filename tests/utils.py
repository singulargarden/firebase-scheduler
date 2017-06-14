"""
Basics, verify that we can schedule operations and that they are eventually executed.

Later we'll generate random names and clean them through fixture,
this'll make the test parallelisable and easier to reproduce.

TODO: use POSTs instead of GETs, check that app engine cron supports it.
"""

import os
import requests

URL_FIREBASE_FUNCTIONS = os.environ['URL_FIREBASE_FUNCTIONS']

URL_SHORT_BLEEP = f'{URL_FIREBASE_FUNCTIONS}/bleep'
URL_SHOW_BLEEP = f'{URL_FIREBASE_FUNCTIONS}/showBleep'

URL_RUNNER = f'{URL_FIREBASE_FUNCTIONS}/check/%d/%s'
URL_RUNNER = 'http://localhost:8080/check/%d/%s'

URL_GET_SCHEDULE = f'{URL_FIREBASE_FUNCTIONS}/get'
URL_CANCEL_SCHEDULE = f'{URL_FIREBASE_FUNCTIONS}/cancel'


def url_runner(runner_name='bleeper', duration=5):
    return URL_RUNNER % (duration, runner_name,)


def run(scheduler='bleeper', duration=5):
    r = requests.get(url_runner(scheduler, duration))
    assert r.status_code == 200
    return r.json()


def show():
    r = requests.get(URL_SHOW_BLEEP)
    assert r.status_code == 200

    j = r.json() or {}
    j['lastRuns'] = [x['call'] for x in j.get('all', {}).values()]
    return j


def get(item_id, scheduler=None, expect=200):
    params = {'item_id': item_id}

    if scheduler is not None:
        params['scheduler'] = scheduler

    r = requests.get(URL_GET_SCHEDULE, params=params)
    assert r.status_code == expect, f'{URL_GET_SCHEDULE} replied with {r.status_code} instead of {expect}'
    return r.json()

def cancel(item_id, scheduler=None, expect=200):
    params = {'item_id': item_id}

    if scheduler is not None:
        params['scheduler'] = scheduler

    r = requests.get(URL_CANCEL_SCHEDULE, params=params)
    assert r.status_code == expect, f'{URL_CANCEL_SCHEDULE} replied with {r.status_code} instead of {expect}'
    return r.json()


def bleep(scheduler=None, seconds=1, expect=200):
    params = {}
    if scheduler:
        params['scheduler'] = scheduler
    if seconds:
        params['seconds'] = seconds

    r = requests.get(URL_SHORT_BLEEP, params=params)
    assert r.status_code == expect
    return r.json()
