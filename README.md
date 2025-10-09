# drikkeleker

> A collection of drinking games from the Abakus student association.

## Getting Started

First, install the dependencies using yarn:

```bash
yarn
```

Then, run the development server:

```bash
yarn dev
```

## To run locally:

Go to backend, greate .env file and include something like this:

```
MONGO_URI=mongodb://127.0.0.1:27017/gameroom
PORT=3001
```

and then run:

```bash
cd gameroom-backend
yarn install
yarn start
```

and in the frontend:
change the file in: src/app/game-room/[roomCode]/page.tsx
and in src/app/lobby/page.tsx
change the fetch URL to your local backend, e.g. `http://localhost:3001` (the same port as in the .env file)

(Do this by commenting out line 56 in the [roomCode]/page.tsx file and uommenting out line 56, and for the local lobby/page.tsx file you comment out 29 and uncomment 30)

then run:

```bash
yarn dev
```

The site should now be running at [http://localhost:3000](http://localhost:3000).

## Contributing

We would love your contributions. To find out how to, read our [CONTRIBUTING.md](./CONTRIBUTING.md)
