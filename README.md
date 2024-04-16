# drikkeleker

> "Webkom's mange morsomme drikkeleker, samlet på ett sted"

![last_commit](https://badgen.net/github/last-commit/webkom/drikkeleker) ![open_issues](https://badgen.net/github/open-issues/webkom/drikkeleker)

## Prerequisites

- [Docker](https://docs.docker.com/) : For you to be able to run the app in production as intended. Also look into `docker-compose`
- [Bun](aa.com) : Used as a package manager. Replaces `yarn`, `npm` etc.

## Sections

1. [Quick Start](#quick-start)
2. [Build and Deploy](#build-and-deploy)

## Quick Start

```sh
bun install # install dependencies
bun run dev # start webserver. Currently no backend.
```

The webapp should now be running on [localhost:5137](http://localhost:5137). Keep in mind that not everything is 100% "hot-reload'able", so you might have to hard refresh to get your recently saved changes sometimes.
This is mostly the case for libraries like `redux`

## Build and Deploy

### Dockerized deployment

...
Everything is configured in the `Dockerfile` and the `docker-compose.yml` files.
All you have to run in

```sh
docker-compose up -d
```

And you will have a running production container on **PORT 3000**

### Manual deployment

> Note: This concerns a deployment on the specific machine you are operating on

In case you don't want to run things on docker, you can use the regular bun scripts

First, bundle and build the source code into the `dist` folder

```sh
bun bundle
```

> The dist folder should be reconstructed every time you rerun the script

There are two ways to run the build:

- **serve mode**: Meant for long term serving.
- **vite preview mode**: This is mostly to confirm that the built bundle works as expected

To run the bundled code in **serve mode**:

```sh
bun serve # this will automatically serve the webapp on port:3000
```

You can also serve to a specific port manually with:

```sh
serve -s ./dist -l <PORT NUMBER>
```

To run the bundled code in **preview mode**:

```sh
bun preview
```
