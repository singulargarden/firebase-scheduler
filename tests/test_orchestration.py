"""
Verify that we can orchestrate operations,
"""
from utils import bleep, get, run, cancel


def test_bleep_returns_an_id(scheduler_name):
    j = bleep(scheduler=scheduler_name)

    assert j['id']


def test_get_missing_item_returns_404(scheduler_name):
    get('42', scheduler=scheduler_name, expect=404)


def test_get_scheduled_item(scheduler_name):
    j = bleep(scheduler=scheduler_name)
    id_ = j['id']

    j = get(id_, scheduler=scheduler_name)
    assert j is not None


def test_after_run_get_will_404(scheduler_name):
    j = bleep(scheduler=scheduler_name)
    id_ = j['id']

    run(scheduler=scheduler_name)

    get(id_, scheduler=scheduler_name, expect=404)


def test_we_can_cancel_jobs(scheduler_name):
    j = bleep(scheduler=scheduler_name)
    id_ = j['id']

    cancel(id_, scheduler=scheduler_name)
    j = run(scheduler=scheduler_name)

    assert j['processedCount'] == 0
