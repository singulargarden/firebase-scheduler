"""
Basics, verify that we can schedule operations and that they are eventually executed.

Later we'll generate random names and clean them through fixture,
this'll make the test parallelisable and easier to reproduce.

TODO: use POSTs instead of GETs, check that app engine cron supports it.
"""
import time

from utils import run, show, bleep


def test_scheduler_returns_last_execution_and_the_count_of_processed_items():
    j = run()

    assert 'lastRun' in j
    assert 'processedCount' in j


def test_scheduler_has_nothing_to_process_when_it_starts():
    j = run()
    assert j['processedCount'] == 0


def test_bleep_short_will_produce_a_run_immediately():
    # Arrange, Act, Assert
    bleep()
    j = run()
    assert j['processedCount'] == 1


def test_bleep_short_will_be_processed_then_disappear():
    # Arrange
    bleep()
    run()

    # Act
    j = run()

    # Assert
    assert j['processedCount'] == 0


def test_multiple_bleep_short_will_produce_multiple_runs_immediately():
    # Arrange
    bleep()
    bleep()
    bleep()

    # Act
    j = run()

    # Assert
    assert j['processedCount'] == 3


def test_a_scheduled_job_will_be_removed_once_the_runner_went_through_it():
    # Arrange
    bleep()
    run()

    # Act
    j = run()

    # Assert
    assert j['processedCount'] == 0


def test_scheduling_to_one_id_wont_produce_a_request_to_another():
    # Arrange
    bleep(scheduler='my_scheduler')

    # Act
    j1 = run()
    j2 = run('my_scheduler')

    # Assert
    assert j1['processedCount'] == 0
    assert j2['processedCount'] == 1


def test_show_bleep_returns_something():
    j = bleep(expect=200)
    assert j is not None


def test_schedule_then_runner_will_trigger_my_final_endpoint():
    # Arrange
    bleep()

    # Act
    j1 = show()
    run()
    j2 = show()

    # Assert
    assert j1.get('lastCall', 0) < j2.get('lastCall', 0)


def test_runner_will_process_only_items_for_current_time():
    # Arrange, Act, Assert
    bleep(seconds=10)
    j = run()
    assert j['processedCount'] == 0

    # Arrange, Act, Assert
    time.sleep(10)
    j = run()
    assert j['processedCount'] == 1


def test_runner_will_wait_to_process_jobs_at_a_current_time():
    # Arrange
    bleep(seconds=1)
    bleep(seconds=15)

    # Act
    run(duration=20)

    last_runs = show()['lastRuns']
    assert (last_runs[-1] - last_runs[-2]) > 8000
