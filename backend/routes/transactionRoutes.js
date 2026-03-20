const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');
const { convertCurrency, getSupportedCurrencies } = require('../utils/currencyService');
const { generateInvoicePDF } = require('../utils/invoiceGenerator');
const { sendTransactionEmail } = require('../utils/emailSender');

const router = express.Router();

// @route   POST /api/transactions/convert
// @desc    Convert currency and save transaction
// @access  Private
router.post('/convert', protect, async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;

    // Validation
    if (!fromCurrency || !toCurrency || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fromCurrency, toCurrency, and amount',
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }

    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: 'Source and target currencies cannot be the same',
      });
    }

    // Perform currency conversion
    const conversionResult = await convertCurrency(fromCurrency, toCurrency, numAmount);

    // Save transaction to database
    const transaction = await Transaction.create({
      user: req.user._id,
      fromCurrency: conversionResult.fromCurrency,
      toCurrency: conversionResult.toCurrency,
      amount: conversionResult.amount,
      convertedAmount: conversionResult.convertedAmount,
      rate: conversionResult.rate,
    });

    // Generate PDF invoice (non-blocking)
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoicePDF(transaction, req.user);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError.message);
    }

    // Send email (non-blocking - don't fail transaction if email fails)
    sendTransactionEmail(req.user, transaction, pdfBuffer).catch((err) =>
      console.error('Email error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Currency converted successfully',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        fromCurrency: transaction.fromCurrency,
        toCurrency: transaction.toCurrency,
        amount: transaction.amount,
        convertedAmount: transaction.convertedAmount,
        rate: transaction.rate,
        gstAmount: transaction.gstAmount,
        totalAmount: transaction.totalAmount,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      hasPdf: !!pdfBuffer,
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Currency conversion failed',
    });
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

// @route   GET /api/transactions/:id/invoice
// @desc    Download invoice PDF for a transaction
// @access  Private
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const pdfBuffer = await generateInvoicePDF(transaction, req.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice_${transaction.transactionId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice download error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
});

// @route   GET /api/transactions/currencies
// @desc    Get supported currencies
// @access  Private
router.get('/currencies', protect, (req, res) => {
  const currencies = getSupportedCurrencies();
  res.status(200).json({ success: true, currencies });
});

module.exports = router;
