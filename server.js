// server.js
require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

const AZUL_URL = "https://pruebas.azul.com.do/WebServices/JSON/Default.aspx";
const AUTH1 = process.env.AUTH1;
const AUTH2 = process.env.AUTH2;
const MERCHANT = process.env.MERCHANT_ID;

// Payment endpoint
app.post("/api/pay", async (req, res) => {
  try {
    const { CardNumber, Expiration, CVC, Amount, OrderNumber } = req.body;

    if (!CardNumber || !Expiration || !CVC || !Amount || !OrderNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payload = {
      Channel: "EC",
      Store: MERCHANT,
      CardNumber,
      Expiration,
      CVC,
      PosInputMode: "E-Commerce",
      TrxType: "Sale",
      Amount,
      ITBIS: "00",
      OrderNumber,
    };

    const response = await fetch(AZUL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Auth1": AUTH1,
        "Auth2": AUTH2,
      },
      body: JSON.stringify(payload),
      timeout: 15000,
    });

    const json = await response.json();
    return res.json({ azul: json });
  } catch (err) {
    console.error("Error in /api/pay:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 3DS TermUrl callback (for ACS challenge result)
app.post("/api/3ds/term", bodyParser.urlencoded({ extended: true }), (req, res) => {
  console.log("3DS TermUrl received:", req.body);
  res.send(`<html><body>
    <h2>3DS Result Received</h2>
    <pre>${JSON.stringify(req.body, null, 2)}</pre>
    <p>You can close this window now.</p>
  </body></html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
