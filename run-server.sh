#!/bin/bash
cd /home/z/my-project
node node_modules/.bin/next dev -p 3000 -H 0.0.0.0 &
NODE_PID=$!
echo $NODE_PID > /home/z/my-project/server.pid
wait $NODE_PID
