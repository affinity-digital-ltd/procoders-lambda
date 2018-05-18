'use strict'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const checkForFinishedPayments = async (event, context) => {
  let totalPaid, totalDue, result

  const body = JSON.parse(event.body)
  
  // Set the customer id
  const customerID = {
    customer: body.data.object.customer,
    limit: 100
  }
  
  try {
    const subscriptions = await stripe.subscriptions.list(customerID)
    
    if (subscriptions.data.length === 0) {
      throw new Error('Customer does not have any subscriptions')
    }
    
    const subscriptionID = subscriptions.data[0].id
    const subscriptionPlan = subscriptions.data[0].items.data[0].plan.id
    
    // Work out the total for all successful payments made
    const query = Object.assign({}, customerID, {paid: true, refunded: false})
    const paidCharges = await stripe.charges.list(query)
    
    // Add together all payments made and return total
    if (paidCharges.data.length > 0) {
      totalPaid = paidCharges.data.map(item => item.amount).reduce((accumulator, item) => {
        return accumulator + item
      })
    } else {
      totalPaid = 0
    }
    
    // Define the old subscription prices that no longer exist in Stripe
    const subscriptionPrices = {
      Instalments: 350000,
      Parttime: 100000
    }
    
    // Work out how much they need to pay in total
    if (subscriptionPrices[subscriptionPlan]) {
      totalDue = Number(subscriptionPrices[subscriptionPlan])
    } else {
      totalDue = Number(subscriptionPlan.split('_')[0])
    }
    
    // Cancel the subscription if they have finished paying in full
    if (totalDue === totalPaid) {
      await stripe.subscriptions.del(subscriptionID)
      result = 'Cancelled Subscription'
    } else if (totalDue > totalPaid) {
      result = `${totalDue - totalPaid} remaining`
    } else {
      throw new Error('Total paid is more than total due')
    }
    
    // Return response payload
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: result,
        input: event
      })
    }
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        message: String(error),
        input: event
      })
    }
  }
}

module.exports.call = checkForFinishedPayments
