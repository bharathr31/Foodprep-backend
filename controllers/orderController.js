

const orderModel = require('../models/orderModel')
const userModel  = require('../models/userModel')
const stripe     = require('stripe')(process.env.STRIPE_SECRET_KEY)

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173"
  try {
    // 1. Persist the order with the front-end’s calculated amount
    const newOrder = await orderModel.create({
      userId:  req.userId,
      items:   req.body.items,
      amount:  req.body.amount,
      address: req.body.address
    })

    // 2. Clear the user’s cart
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} })

    // 3. Create a single Stripe line item for the total (in paise)
    const amountInPaise = Math.round(req.body.amount * 100)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency:     'inr',
            product_data: { name: 'FoodPrep Order' },
            unit_amount:  amountInPaise
          },
          quantity: 1
        }
      ],
      mode:        'payment',
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url:  `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
    })

    // 4. Return the session URL
    return res.json({ session_url: session.url })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message })
  }
}

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body
  try {
    if (success === 'true') {
      await orderModel.findByIdAndUpdate(orderId, { payment: true })
      return res.json({ message: "Payment successful" })
    } else {
      await orderModel.findByIdAndDelete(orderId)
      return res.json({ message: "Not paid" })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message })
  }
}

const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId })
    return res.status(200).json({ data: orders })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find()
    return res.json({ data: orders })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message })
  }
}

const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status })
    return res.json({ message: "Status updated" })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message })
  }
}

module.exports = {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus
}
