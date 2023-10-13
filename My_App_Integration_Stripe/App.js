const stripe = require("stripe")(
  "sk_test_51NzFxPGkDhRI7MByPyhHgWJUPnu98JCewdJQOZCxoiF3KHz7LaxLZ5YEUVZEIMwTmAQt7NFVMcBwO09l0pZYFBWg00mTowC8h5"
);
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(express.json()); // Make sure to invoke the express.json() middleware
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());

app.listen(5000, () => console.log("Server Started"));

app.post("/confirm-payment", async (req, res) => {
  const { paymentIntentId, paymentMethod } = req.body;
  console.log("REQUEST BODY", req.body);
  console.log("PAYMENT ID", paymentIntentId);
  console.log("PAYMENT METHOD", paymentMethod);
  try {
    // To create a PaymentIntent for confirmation, see our guide at: https://stripe.com/docs/payments/payment-intents/creating-payment-intents#creating-for-automatic
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("REAL IDDDDDDDDDDD:", paymentIntent.id);
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method: "pm_card_visa",
        return_url: "http://localhost:3000/",
      }
    );

    if (confirmedPaymentIntent.status === "succeeded") {
      res.json({ success: true });
    } else {
      console.error(
        "Payment failed:",
        confirmedPaymentIntent.last_payment_error
      );
      res.json({
        success: false,
        message: "Payment failed",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-checkout-session", async (req, res) => {
  const products = req.body.products;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: products[0].price * 100,
      currency: "usd",

      automatic_payment_methods: { enabled: true },
    });
    console.log("IDDDDDDDDDDDDDDDDDDD", paymentIntent.id);
    res.json({
      paymentIntent: paymentIntent,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      payment_method_types: paymentIntent.payment_method_types,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
