all: build deploy

build:
	cd remindme && lein cljsbuild once release

deploy:
	firebase deploy
