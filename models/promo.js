const mongoose = require('mongoose')

const promoSchema = new mongoose.Schema({
  code:         { type: String, unique: true, required: true },
  discountPct:  { type: Number, min: 1, max: 200, required: true },
  maxUses:      { type: Number, min: 1, required: true },
  usedCount:    { type: Number, default: 0 },
  expiresAt:    { type: Date, required: true }
})

module.exports = mongoose.model('Promo', promoSchema)
