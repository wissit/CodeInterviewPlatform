#!/bin/sh

# Start Nginx in background
nginx

# Start Node Backend in foreground
cd /app/backend
node dist/index.js
