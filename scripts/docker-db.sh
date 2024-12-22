#!/bin/bash

# Check if container already exists
if [ "$(docker ps -aq -f name=football-pool-postgres)" ]; then
    # Check if container is running
    if [ ! "$(docker ps -q -f name=football-pool-postgres)" ]; then
        echo "Starting existing football-pool-postgres container..."
        docker start football-pool-postgres
    else
        echo "football-pool-postgres container is already running"
    fi
else
    echo "Creating and starting new football-pool-postgres container..."
    docker run --name football-pool-postgres \
        -e POSTGRES_PASSWORD=password \
        -e POSTGRES_USER=admin \
        -e POSTGRES_DB=verceldb \
        -p 5433:5432 \
        -d postgres
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Test connection
if docker exec football-pool-postgres pg_isready -U admin > /dev/null 2>&1; then
    echo "Database is ready!"
else
    echo "Database connection failed!"
fi