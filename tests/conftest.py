import random

import pytest
import time


@pytest.fixture
def scheduler_name():
    yield 'test_%010d_%010d' % (time.time(), random.randint(0, 10 ** 9))
