// ===== BACKEND: /pages/api/create-checkout-session.ts =====
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// Good - you're now using the secret key
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_API_KEY, {

});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // FIXED: Added charity parameter that was missing
  const { amount, charity, nonprofitStripeAccountId } = req.body;

  console.log('Received donation request:', { amount, charity, nonprofitStripeAccountId });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: charity ? `Donation to ${charity}` : "Donation",
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: "acct_1S7ANOKQwKSWCQgE", // connected account ID
        },
        // optional: take platform fee
        // application_fee_amount: Math.floor(amount * 0.05), // 5% fee
      },
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}&charity=${encodeURIComponent(charity || 'Unknown')}&amount=${amount}`,
      cancel_url: `http://localhost:3000/cancel`,
      metadata: {
        charity: charity || 'Unknown',
        amount: amount.toString(),
      }
    });

    console.log('Checkout session created:', session.id);
    
    // FIXED: Return both id and url, and use consistent naming
    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url,
      id: session.id // Keep for backwards compatibility
    });

  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).json({ 
      error: "Failed to create session",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}