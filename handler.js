'use strict'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const checkForFinishedPayments = async (event, context) => {
  let subscription, subscriptionID, totalPaid, totalDue
  const body = JSON.parse(event.body)
  let message

  // Set the customer id
  const requestParams = {
    customer: body.data.object.customer,
    limit: 100
  }

  console.log('requestParams', requestParams)

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
  let subscriptions

  // Get the subscription plan and ID
  try {
    subscriptions = await stripe.subscriptions.list(requestParams)
  } catch (error) {
    throw new Error(error)
  }
  
  if (subscriptions.data.length === 0) {
    throw new Error('Customer does not have any subscriptions')
  } 
  
  const subscriptionID = subscriptions.data[0].id
  const subscription = subscriptions.data[0].items.data[0].plan.id

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
