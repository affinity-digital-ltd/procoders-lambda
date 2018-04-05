'use strict'
const axios = require('axios')

const getSubscription = async (requestParams) => {
  await axios.get('https://api.stripe.com/v1/subscriptions', requestParams).then((response) => {
    return response.data.data[0].plan.id
  })
}

const calculateTotalPaid = async (requestParams) => {
  await axios.get('https://api.stripe.com/v1/charges', requestParams).then((response) => {
    const paidCharges = response.data.data.filter(item => {
      return item.paid === true
    })

    const totalPaid = paidCharges.map(item => item.amount).reduce((accumulator, item) => {
      return accumulator + item
    })

    return totalPaid
  })
}

const checkForFinishedPayments = async (event, context, callback) => {
  let subscription, totalPaid, totalDue
  const requestParams = {
    params: {
      customer: 'cus_CcwfusO0OF8LTI',
      limit: 100
    },
    auth: {
      username: 'sk_test_VuKUCnJ0MRLhRLNnsIGQs8Ve',
      password: ''
    }
  }
  const subscriptions = {
    Instalments: 350000,
    Parttime: 100000
  }

  try {
    subscription = getSubscription(requestParams)
    totalPaid = calculateTotalPaid(requestParams)
  } catch (error) {
    console.log(error)
  }

  if (subscriptions[subscription]) {
    totalDue = subscriptions[subscription]
  } else {
    totalDue = subscription.split('_')[0]
  }

  console.log(totalDue)
  console.log(totalPaid)

  if (totalDue === totalPaid) {
    console.log('cancel subscription')
  } else {
    console.log(`${totalDue - totalPaid} remaining`)
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event
    })
  }

  callback(null, response)

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
}

module.exports.call = checkForFinishedPayments

checkForFinishedPayments('', '', () => {})
