#!/bin/sh

cp -n -a dist/images/* src/images/
git status
git add src/images/
git commit -m "Persist images"
