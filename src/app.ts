/* eslint-disable no-console */
import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import handleStripeWebhook from './stripe/handleStripeWebhook';
// import stripe from './config/stripe';
const app = express();

// Stripe webhook route
// app.use('/api/stripe/webhook',
//     express.raw({ type: 'application/json' }),
//     handleStripeWebhook
// );

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

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
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `
  );
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
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

export default app;
