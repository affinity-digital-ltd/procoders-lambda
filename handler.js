'use strict'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_VuKUCnJ0MRLhRLNnsIGQs8Ve')

const checkForFinishedPayments = async (event, context) => {
  let subscription, subscriptionID, totalPaid, totalDue
  const body = JSON.parse(event.body)
  let message

  // Set the customer id
  const requestParams = {
    customer: body.data.object.customer,
    limit: 100
  }

  try {
    [subscriptionID, subscription] = await getSubscriptionPlan(requestParams)
    totalPaid = await getTotalPaid(requestParams)
    totalDue = calculateTotalDue(subscription)
  } catch (error) {
    throw new Error(error)
  }

  // Cancel the subscription if they have finished paying in full
  if (totalDue === totalPaid) {
    try {
      await stripe.subscriptions.del(subscriptionID)
      message = 'Cancelled Subscription'
    } catch (error) {
      throw new Error(error)
    }
  } else if (totalDue > totalPaid) {
    message = `${totalDue - totalPaid} remaining`
  } else {
    throw new Error('Total paid is more than total due')
  }
  
  let response = {
    statusCode: 200,
    body: JSON.stringify({
      message: message,
      input: event
    })
  }

 return response
}

const getSubscriptionPlan = async (requestParams) => {
  let subscriptionID, subscription

  // Get the subscription plan and ID
  try {
    const subscriptions = await stripe.subscriptions.list(requestParams)
    subscriptionID = subscriptions.data[0].id
    subscription = subscriptions.data[0].items.data[0].plan.id
  } catch (error) {
    throw new Error(error)
  }
  return [subscriptionID, subscription]
}

const getTotalPaid = async (requestParams) => {
  let totalPaid

  // Work out the total for all successful payments made
  try {
    const charges = await stripe.charges.list(requestParams)
    const paidCharges = charges.data.filter(item => {
      return item.paid === true
    })

    totalPaid = paidCharges.map(item => item.amount).reduce((accumulator, item) => {
      return accumulator + item
    })
  } catch (error) {
    throw new Error(error)
  }
  return totalPaid
}

const calculateTotalDue = (subscription) => {
  let totalDue

  // Define the old subscription prices
  const subscriptionPrices = {
    Instalments: 350000,
    Parttime: 100000
  }

  // Work out how much they need to pay in total
  if(subscriptionPrices[subscription]) {
    totalDue = subscriptionPrices[subscription]
  } else {
    totalDue = subscription.split('_')[0]
  }

  return Number(totalDue)
}

module.exports.call = checkForFinishedPayments
