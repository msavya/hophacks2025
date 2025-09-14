// Mock API endpoint for creating payment intents
// In a real app, this would be a server-side endpoint

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency = 'usd' } = req.body;

  if (!amount || amount < 50) { // Minimum $0.50
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Mock payment intent response
  // In a real app, you would call Stripe API here
  const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

  res.status(200).json({
    clientSecret: mockClientSecret,
    amount: amount,
    currency: currency
  });
}
