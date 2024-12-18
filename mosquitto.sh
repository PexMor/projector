#!/bin/bash

mkdir -p tmp/{log,persistence}

cat <<DATA
Running websocket on:
    ws://localhost:1884/
DATA

mosquitto -c mosquitto.conf
