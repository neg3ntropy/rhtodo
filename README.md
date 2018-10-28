# RHTODO

A ReST API for TODOs.

## Development requirements

* Node v8.10
* npm 6.4.1
* aws cli 1.11.133

## Running tests

Export AWS credentials and `AWS_REGION` variables. Then run

```sh
$ npm run test
$ npm run test-integration
$ npm run test-system
```

## Deployment

To deploy an individual environment:

```sh
$ scripts/dev.sh deploy
```
