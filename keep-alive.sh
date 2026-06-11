#!/bin/bash
cd /home/z/my-project
while true; do
  node node_modules/.bin/next dev -p 3000 -H 0.0.0.0 2>&1
  echo "[$(date)] Server died, restarting in 2s..." >> /home/z/my-project/watchdog.log
  sleep 2
done
