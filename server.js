import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// ✅ Allow requests from your Vite frontend
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_API_KEY, {
  apiVersion: "2022-11-15",
});

app.post("/api/create-checkout-session", async (req, res) => {
  const { amount, nonprofitStripeAccountId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Donation" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: nonprofitStripeAccountId,
        },
      },
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

const PORT = 4242;
app.listen(PORT, () => console.log(`Stripe server running on http://localhost:${PORT}`));
