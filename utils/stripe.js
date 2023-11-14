import { default as queryString } from 'querystring'

const 
{
  STRIPE_KEY
} = process.env

const STRIPE_URL='https://api.stripe.com/v1'
const AUTH = `Bearer ${STRIPE_KEY}`

const newCustomer = async ( params ) =>
{
  const response =  await fetch(`${STRIPE_URL}/customers?${queryString.stringify(params)}`, 
    {
      method: 'POST',
      headers: 
        {
          'Authorization': AUTH
        }
    })
  return response.json()
}

const addOneSubscription = async ( params ) =>
{
  const 
  {
    customer,
    subscription
  } = params

  const response = await fetch(`${STRIPE_URL}/subscriptions?customer=${customer}&items[0][price]=${subscription}`, 
  {
    method: 'POST',
    headers:
      {
        'Authorization': AUTH
      }
  })
  return response.json()
}


export { newCustomer, addOneSubscription }
