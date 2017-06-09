(ns remindme.runner
    (:require [doo.runner :refer-macros [doo-tests]]
              [remindme.core-test]))

(doo-tests 'remindme.core-test)
