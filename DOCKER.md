# Docker

This project runs as two containers using Docker: a Node/Express backend and an nginx frontend.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Building the images

Run both build commands from the **monorepo root**:

```bash
docker build -f frontend/Dockerfile -t renci-frontend .
docker build -f backend/Dockerfile -t renci-backend .
```

You only need to rebuild when you make code changes.

## Running the containers

The frontend container shares the backend container's network stack, so the **backend must be started first**.

```bash
# 1. Start the backend
docker run --rm -d -p 80:80 --name renci-backend --env-file .env renci-backend

# 2. Start the frontend (attaches to backend's network)
docker run --rm -d --name renci-frontend --network container:renci-backend renci-frontend
```

Then visit [http://localhost](http://localhost) in your browser.

## Stopping the containers

Stop the frontend before the backend — the frontend depends on the backend's network stack.

```bash
docker stop renci-frontend renci-backend
```

Both containers are automatically removed on stop (`--rm`). The images remain and can be run again immediately.

## Useful commands

```bash
# Check running containers
docker ps

# Check all containers including stopped
docker ps -a

# View logs
docker logs renci-backend
docker logs renci-frontend

# Follow logs in real time
docker logs -f renci-backend
docker logs -f renci-frontend

# List all local images
docker images
```

## Environment variables

The backend container loads environment variables from `.env` at the monorepo root via `--env-file .env`. See `.env.example` for required variables.

## Notes

- The frontend nginx proxies `/api/` requests to the backend via `localhost:3001` — this works because both containers share the same network namespace via `--network container:renci-backend`.
- The backend must be running for the frontend container to start successfully.
- `--network host` is not used as it does not work on macOS with Docker Desktop.