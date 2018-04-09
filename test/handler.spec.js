'use strict'
const handler = require('../handler')
const webhook = require('./fixtures/webhook')
const nock = require('nock')

describe('Handling payments', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  test('Outstanding balance', async () => {
    const subscriptions = require('./fixtures/subscriptions')
    const charges = require('./fixtures/remainingCharges')
    const subscriptionsRequest = nock('https://api.stripe.com/v1')
                  .get('/subscriptions')
                  .reply(200, subscriptions)
    const chargesRequest = nock('https://api.stripe.com/v1')
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
    const subscriptionsRequest = nock('https://api.stripe.com/v1')
                  .get('/subscriptions')
                  .reply(200, subscriptions)
    const chargesRequest = nock('https://api.stripe.com/v1')
                  .get('/charges')
                  .reply(200, charges)
    const cancelSubscriptionRequest = nock('https://api.stripe.com/v1')
                  .delete('/subscriptions/sub_CdHSJVXNFzHwzw')
                  .reply(200, cancelSubscription)
  
    const request = await handler.call({ body: JSON.stringify(webhook) }, '')
    const response = JSON.parse(request.body)
    
    expect(response.message).toBe('Cancelled Subscription')
  })
  
  test('Over paying', async () => {
    const subscriptions = require('./fixtures/subscriptions')
    const charges = require('./fixtures/overPaid')
    const subscriptionsRequest = nock('https://api.stripe.com/v1')
                  .get('/subscriptions')
                  .reply(200, subscriptions)
    const chargesRequest = nock('https://api.stripe.com/v1')
                  .get('/charges')
                  .reply(200, charges)
  
    async function request() {
      await handler.call({ body: JSON.stringify(webhook) }, '')
    }
    
    expect(request()).rejects.toEqual(new Error('Total paid is more than total due'))
  })
})