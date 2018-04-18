'use strict'
const handler = require('../handler')
const webhook = require('./fixtures/webhook')
const nock = require('nock')

describe('Handling payments', () => {
  nock.disableNetConnect()

  afterEach(() => {
    nock.cleanAll()
  })

  test('Outstanding balance', async () => {
    const subscriptions = require('./fixtures/subscriptions')
    const charges = require('./fixtures/remainingCharges')
    nock('https://api.stripe.com/v1')
                  .get('/subscriptions')
                  .reply(200, subscriptions)
    nock('https://api.stripe.com/v1')
                  .get('/charges')
                  .reply(200, charges)

    const request = await handler.call({ body: JSON.stringify(webhook) }, '')
    const response = JSON.parse(request.body)

    expect(response.message).toBe('250000 remaining')
  })

  test('Finished Payment', async () => {
    const subscriptions = require('./fixtures/subscriptions')
    const charges = require('./fixtures/allPaid')
    const cancelSubscription = require('./fixtures/cancelSubscription')
    nock('https://api.stripe.com/v1')
                  .get('/subscriptions')
                  .reply(200, subscriptions)
    nock('https://api.stripe.com/v1')
                  .get('/charges')
                  .reply(200, charges)
    nock('https://api.stripe.com/v1')
                  .delete('/subscriptions/sub_CdHSJVXNFzHwzw')
                  .reply(200, cancelSubscription)

    const request = await handler.call({ body: JSON.stringify(webhook) }, '')
    const response = JSON.parse(request.body)

    expect(response.message).toBe('Cancelled Subscription')
  })

  test('Over paying', async () => {
    const subscriptions = require('./fixtures/subscriptions')
    const charges = require('./fixtures/overPaid')
    nock('https://api.stripe.com/v1')
                  .get('/subscriptions')
                  .reply(200, subscriptions)
    nock('https://api.stripe.com/v1')
                  .get('/charges')
                  .reply(200, charges)

    const response = await handler.call({ body: JSON.stringify(webhook) }, '')
    const body = JSON.parse(response.body)

    expect(body.message).toBe('Error: Total paid is more than total due')
    expect(response.statusCode).toBe(502)
  })

  test('User has no subscriptions', async () => {
    const subscriptions = require('./fixtures/noSubscriptions')
    const charges = require('./fixtures/overPaid')
    nock('https://api.stripe.com/v1')
                  .get('/subscriptions')
                  .reply(200, subscriptions)
    nock('https://api.stripe.com/v1')
                  .get('/charges')
                  .reply(200, charges)

    const response = await handler.call({ body: JSON.stringify(webhook) }, '')
    const body = JSON.parse(response.body)

    expect(body.message).toBe('Error: Customer does not have any subscriptions')
    expect(response.statusCode).toBe(502)
  })
})
