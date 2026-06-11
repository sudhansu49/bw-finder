#!/bin/bash
cd /home/z/my-project
while true; do
  node node_modules/.bin/next dev -p 3000 -H 0.0.0.0
  echo "Server died, restarting in 3s..." >> /home/z/my-project/watchdog.log
  sleep 3
done
