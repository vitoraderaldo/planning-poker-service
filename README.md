## Description

[Nest](https://github.com/nestjs/nest) application to be used to estimate effort or relative size of development goals in software development.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ docker-compose up mongo-test
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Documentation

This application uses Swagger to describe the RESTful API.
You can access the documentation by running:
```bash
$ npm run start:dev
```
And then navigate to http://localhost:3000/doc/
