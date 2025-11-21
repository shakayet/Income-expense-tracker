"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./routes"));
const morgen_1 = require("./shared/morgen");
// import handleStripeWebhook from './stripe/handleStripeWebhook';
// import stripe from './config/stripe';
const app = (0, express_1.default)();
// Stripe webhook route
// app.use('/api/stripe/webhook',
//     express.raw({ type: 'application/json' }),
//     handleStripeWebhook
// );
// app.post(
//   '/api/stripe/webhook',
//   express.raw({ type: 'application/json' }),
//   handleStripeWebhook
// );
//morgan
app.use(morgen_1.Morgan.successHandler);
app.use(morgen_1.Morgan.errorHandler);
//body parser
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//file retrieve
app.use(express_1.default.static('uploads'));
//router
app.use('/api/v1', routes_1.default);
// TODO
// app.post('/create-checkout-session', async (req: Request, res: Response) => {
//   const { id } = req.body;
//   console.log('Checkout session request received with plan ID:', id);
//   try {
//     const session = await stripe.checkout.sessions.create({
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: id, // this should be the Stripe Price ID, not the plan id
//           quantity: 1,
//         },
//       ],
//       success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `http://localhost:5173/cancelled`,
//     });
//     return res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error('Checkout session error:', error);
//     return res.status(500).json({ message: 'Something went wrong', error });
//   }
// });
//live response
app.get('/', (req, res) => {
    const date = new Date(Date.now());
    res.send(`<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `);
});
//global error handle
app.use(globalErrorHandler_1.default);
//handle not found route;
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Not found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST",
            },
        ],
    });
});
exports.default = app;
