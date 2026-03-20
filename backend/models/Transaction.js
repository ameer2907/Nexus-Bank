const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    toCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
    },
    convertedAmount: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    transactionId: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

// Generate transaction ID before saving
transactionSchema.pre('save', function (next) {
  if (this.isNew) {
    this.transactionId = 'TXN' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
    const gst = this.convertedAmount * 0.18;
    this.gstAmount = parseFloat(gst.toFixed(4));
    this.totalAmount = parseFloat((this.convertedAmount + gst).toFixed(4));
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
