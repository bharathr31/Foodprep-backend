// controllers/cartController.js

const userModel  = require('../models/userModel')
const promoModel = require('../models/promo')
const foodModel  = require('../models/foodModel')

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId)
    const cart = user.cartData || {}

    cart[req.body.itemId] = (cart[req.body.itemId] || 0) + 1

    await userModel.findByIdAndUpdate(req.userId, { cartData: cart })
    res.status(200).json({ message: 'Item added to cart' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get cart
const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId)
    res.status(200).json({ cartData: user.cartData || {} })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Remove one quantity of an item
const removeFromCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId)
    const cart = user.cartData || {}

    if (cart[req.query.itemId] > 0) {
      cart[req.query.itemId]--
      if (cart[req.query.itemId] === 0) delete cart[req.query.itemId]
    }

    await userModel.findByIdAndUpdate(req.userId, { cartData: cart })
    res.status(200).json({ message: 'Item removed from cart' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Apply a promo code
const applyPromo = async (req, res) => {
  try {
    const { code } = req.body
    const promo = await promoModel.findOne({
      code,
      expiresAt: { $gt: new Date() }
    })
    if (!promo)
      return res.status(404).json({ message: 'Invalid or expired promo code' })
    if (promo.usedCount >= promo.maxUses)
      return res.status(400).json({ message: 'Promo uses exhausted' })

    const user = await userModel.findById(req.userId)
    const cart = user.cartData || {}
    const itemIds = Object.keys(cart)
    if (!itemIds.length)
      return res.status(400).json({ message: 'Cart is empty' })

    const products = await foodModel.find({ _id: { $in: itemIds } }).lean()
    let subtotal = 0
      products.forEach(p => {
        subtotal += (p.price || 0) * (cart[p._id] || 0)
      })

      const discount = promo.discountPct
      promo.usedCount++
    await promo.save()
    const total = subtotal - discount
    // persist to user if desired
    user.appliedPromo = code
    user.discount     = discount
    user.total        = total
    await user.save()

    res.json({ subtotal, discount, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  applyPromo
}
