#!/bin/sh
npm install --silent
./node_modules/.bin/tsc --noEmit 2>&1
