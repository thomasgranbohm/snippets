#!/bin/bash

echo "Waiting for $1 to start..."

while ! curl "$1:$2" &> /dev/null
do
	sleep 1
done