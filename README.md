# RHTODO

A ReST API for TODOs.

## Design

This explores the Command-Query Responsibility Segregation (CQRS) and Event
Sourcing paradigm in a serverless environment on AWS.

This architecture is naturally reactive and virtually unconstrained in
scalability and querability.
The domain model is independent of any particular storage, making it very
testable and strict in maintaing the domain rules. Data with business
relevance is never thrown away.

The solution is based on:

* API Gateway
* Lambda
* DynamoDB and DynamoDbStreams
* Elasticsearch

## Possibly Coming soon

* AWS IoT (serverless websocket notification)
* Cognito (authentication)
* CI/CD pipeline

## Disclaimer

While a good showcase of CQRS/ES/DDD, this is still weekend-level code and a
just a fun exploration of technologies. Many corners were cut.

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

## Accessing Elasticsearch

To query Elasticsearch freely:

```sh

docker run --rm -p 9200:9200 -it -v $HOME/.aws:/root/.aws -e AWS_PROFILE=$AWS_PROFILE abutaha/aws-es-proxy \
  ./aws-es-proxy -endpoint "<endpoing>" -listen 0.0.0.0:9200
```
