'use strict'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const checkForFinishedPayments = async (event, context) => {
  let subscription, subscriptionID, totalPaid, totalDue, message
  const body = JSON.parse(event.body)

  // Set the customer id
  const customerID = {
    customer: body.data.object.customer,
    limit: 100
  }

  try {
    [subscriptionID, subscription] = await getSubscriptionPlan(customerID)
    totalPaid = await getTotalPaid(customerID)
    totalDue = calculateTotalDue(subscription)

    // Cancel the subscription if they have finished paying in full
    message = await attemptToCancelSubscription(totalPaid, totalDue, subscriptionID)
  } catch (error) {
    return respondWithError(event, error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: message,
      input: event
    })
  }
}

const getSubscriptionPlan = async (customerID) => {
  // Get the subscription plan and ID
  const subscriptions = await stripe.subscriptions.list(customerID)

  if (subscriptions.data.length === 0) {
    throw new Error('Customer does not have any subscriptions')
  }

  const subscriptionID = subscriptions.data[0].id
  const subscription = subscriptions.data[0].items.data[0].plan.id

  return [subscriptionID, subscription]
}

const getTotalPaid = async (customerID) => {
  // Work out the total for all successful payments made
  const charges = await stripe.charges.list(customerID)
  const paidCharges = charges.data.filter(item => {
    return item.paid === true
  })

  const totalPaid = paidCharges.map(item => item.amount).reduce((accumulator, item) => {
    return accumulator + item
  })

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
  if (subscriptionPrices[subscription]) {
    totalDue = subscriptionPrices[subscription]
  } else {
    totalDue = subscription.split('_')[0]
  }

  return Number(totalDue)
}

const attemptToCancelSubscription = async (totalPaid, totalDue, subscriptionID) => {
  if (totalDue === totalPaid) {
    await stripe.subscriptions.del(subscriptionID)
    return 'Cancelled Subscription'
  } else if (totalDue > totalPaid) {
    return `${totalDue - totalPaid} remaining`
  } else {
    throw new Error('Total paid is more than total due')
  }
}

const respondWithError = (event, error) => {
  return {
    statusCode: 502,
    body: JSON.stringify({
      message: String(error),
      input: event
    })
  }
}

module.exports.call = checkForFinishedPayments
