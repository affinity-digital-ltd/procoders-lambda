# Background

The purpose of this code and usage can be found in an [article]() we previously published.

## Usage

`yarn global add serverless`

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