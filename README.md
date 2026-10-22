# StarReview AI

React + Vite frontend with an Express API backend.

## Run locally

1. Install Node.js LTS.
2. Open this folder in VS Code.
3. In the terminal, run `npm install`.
4. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`.
5. Run both services with `npm run dev:all`.
6. Open `http://localhost:5173` in your browser. The API health endpoint is `http://localhost:5000/api/health`.

If the combined command does not work, run `npm run dev` in one terminal and `npm run server` in another.

## Razorpay demo and payment QR

The **Payment QR Demo** page creates a QR code that opens this site's Pricing page. Scan it with a phone to see plans and test the demo checkout flow. The QR is a navigation QR, not a direct payment-collection QR. Without Razorpay API keys the backend stays in demo mode and does not take money.

For Razorpay test checkout, add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to the server environment using Razorpay **Test Mode** keys. Never put the secret key in frontend code. For live payments, finish Razorpay account activation/KYC, configure production keys and webhook secret securely, then test payment success, failure, cancellation, and signature verification before launch.

For QR scanning on a phone, use the deployed HTTPS domain (or a network-accessible address). `localhost` on a phone points to the phone itself.

## Notes

- The QR flyer builder supports review, WhatsApp, custom-link, and payment-demo QR targets.
- Footer links navigate to their corresponding pages within the app.
- No real payment credentials are included in this ZIP.

## Safe payment and QR demo

This project is intentionally configured for a simulated checkout only. The checkout buttons and QR demo do not create real Razorpay orders and never collect card or UPI details. The demo checkout can simulate success and failure for presentation purposes only; it does not activate a subscription.

### QR scanning during local development

- Keep your phone and computer on the same Wi-Fi network.
- Start the app with `npm run dev:all` and generate the QR from the QR Flyer page.
- When the app detects a local URL, it attempts to encode the computer's LAN IP address instead of `localhost`.
- If your firewall blocks access, allow Node.js/Vite on your private network.
- To scan from outside your Wi-Fi, deploy the app to an HTTPS domain and set `PUBLIC_URL` to that domain in `.env`.
