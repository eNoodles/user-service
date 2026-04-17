#!/bin/bash

docker rm -f user-service 2>/dev/null

docker run --name user-service \
  --env-file ./docker.env \
  --detach \
  -p 3100:3100 \
  e-drik:latest