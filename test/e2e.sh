#!/usr/bin/env bash

# Update selenium server
npm run webdriver:up

# Start selenium server just for this test run
(npm run webdriver:go &)

# Wait that selenium server will be listening connections
npm run wait:webdriver

# Start the app server
(npm run server &)

# Wait that the server will be listening connections
npm run wait:server

# Finally run protractor
npm run protractor

# Cleanup webdriver-manager and http-server processes
npm run clear:webdriver
npm run clear:server