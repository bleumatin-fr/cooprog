# CoProg

## Install

Prerequisites:

- node v22
- corepack
- yarn berry
- makefile
- docker

```
make install
```

## Develop

Start all the services using:

```
make start
```

- client : http://localhost:3000
- admin : http://localhost:3000/admin
- mail : http://localhost:3000/mailbox
- server : http://localhost:3000/api

Default user credentials are:

- Email: admin@bleumatin.fr
- Password: password

## Build and Deploy

1. Setup environment variables in `packages/client/.env.[staging|production]`

2. Build the project for the given environment.

```bash
BUILD_ENV=[staging|production] API_BASE_URL=[https://cooprog.eu] make build
```

3. Deploy the project through docker compose, see deployment template in `deployment/template`.
