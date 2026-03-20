const axios = require('axios');

// Comprehensive mock exchange rates (base: USD)
const MOCK_RATES = {
  USD: 1.0,
  EUR: 0.9234,
  GBP: 0.7891,
  JPY: 149.82,
  CAD: 1.3621,
  AUD: 1.5287,
  CHF: 0.8932,
  CNY: 7.2341,
  INR: 83.12,
  MXN: 17.15,
  BRL: 4.9821,
  KRW: 1321.45,
  SGD: 1.3412,
  HKD: 7.8234,
  NOK: 10.6234,
  SEK: 10.4521,
  DKK: 6.8921,
  NZD: 1.6234,
  ZAR: 18.7123,
  AED: 3.6725,
  SAR: 3.7501,
  TRY: 30.8234,
  RUB: 90.2341,
  THB: 34.8521,
  MYR: 4.6821,
};

const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  MXN: 'Mexican Peso',
  BRL: 'Brazilian Real',
  KRW: 'South Korean Won',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  NOK: 'Norwegian Krone',
  SEK: 'Swedish Krona',
  DKK: 'Danish Krone',
  NZD: 'New Zealand Dollar',
  ZAR: 'South African Rand',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  TRY: 'Turkish Lira',
  RUB: 'Russian Ruble',
  THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit',
};

// Add small random variation to mock rates to simulate real-time
const getVariedRate = (rate) => {
  const variation = (Math.random() - 0.5) * 0.002; // ±0.1% variation
  return rate * (1 + variation);
};

const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    // Try real API first
    if (process.env.EXCHANGE_RATE_API_KEY) {
      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/pair/${fromCurrency}/${toCurrency}`,
        { timeout: 5000 }
      );
      if (response.data && response.data.conversion_rate) {
        return {
          rate: response.data.conversion_rate,
          source: 'live',
        };
      }
    }
  } catch (error) {
    console.log('⚠️  Live API unavailable, using mock rates');
  }

  // Fallback to mock rates
  const fromRate = MOCK_RATES[fromCurrency.toUpperCase()];
  const toRate = MOCK_RATES[toCurrency.toUpperCase()];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${!fromRate ? fromCurrency : toCurrency}`);
  }

  // Convert via USD base
  const rateInUSD = 1 / fromRate;
  const rate = getVariedRate(rateInUSD * toRate);

  return {
    rate: parseFloat(rate.toFixed(6)),
    source: 'mock',
  };
};

const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  const { rate, source } = await getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = amount * rate;

  return {
    fromCurrency: fromCurrency.toUpperCase(),
    toCurrency: toCurrency.toUpperCase(),
    amount: parseFloat(amount),
    convertedAmount: parseFloat(convertedAmount.toFixed(4)),
    rate: rate,
    source,
  };
};

const getSupportedCurrencies = () => {
  return Object.keys(MOCK_RATES).map((code) => ({
    code,
    name: CURRENCY_NAMES[code] || code,
  }));
};

module.exports = { getExchangeRate, convertCurrency, getSupportedCurrencies };
