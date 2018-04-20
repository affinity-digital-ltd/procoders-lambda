# Background

The purpose of this code and usage can be found in an [article](https://procoders.co.uk/blog/2018-04-20-paying-in-instalments-through-stripe-with-nodejs-810-and-serverless) we previously published.

## Usage

Install Serverless

```
yarn global add serverless
```

Add your credentials and Stripe API key to `.env.dev.yml` and `.env.prod.yml`see `.env.example.yml`for what's required.

Edit `serverless.yml` to match your project name

Deploy your function which will default to the dev environment

```
serverless deploy
```

To deploy to production
```
serverless deploy --stage prod
```

## Tests

To run the test suite, install dependencies 

```
yarn install
```

Then

```
yarn test
```

