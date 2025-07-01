const express = require('express')
const cartRouter = express.Router()
const authMiddleware = require('../middlewares/auth')
 
const {addToCart, getCart, removeFromCart,applyPromo} = require('../controllers/cartController')

cartRouter.get('/get',authMiddleware,getCart)
cartRouter.post('/add',authMiddleware,addToCart)
cartRouter.delete('/remove',authMiddleware,removeFromCart)
cartRouter.post('/apply-promo',authMiddleware,applyPromo)

module.exports = cartRouter