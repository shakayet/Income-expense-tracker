# Income & Expense Tracker Backend

This project is a robust backend for an income and expense tracker, built with TypeScript, Node.js, Express, and Mongoose. It provides a secure, scalable, and feature-rich API for personal finance management, subscription handling, notifications, and more..

## Features (Detailed)

### 1. Authentication & User Management

- **JWT Authentication:** Secure login and registration with JWT tokens.
- **Password Hashing:** User passwords are hashed using bcrypt for security.
- **Role-based Access:** Supports user roles (admin, user, etc.) for protected endpoints.
- **User Profile:** Update profile, change password, and manage user settings.

### 2. Budget & Category Management

- **Monthly Budgets:** Set and update monthly budgets for overall spending.
- **Category Budgets:** Assign budgets to specific categories (e.g., Food, Transport).
- **Expense & Income Tracking:** Add, edit, and delete expenses and incomes, each linked to categories and users.
- **Budget Threshold Alerts:** Automatic notifications when users cross 50%, 75%, 90%, and 100% of their monthly budget, and 80%, 100% of category budgets.

### 3. Notification System & Push Notifications

- **Real-time Notifications:** Delivered via Socket.io for instant updates in web/mobile apps.
- **Push Notifications:** Sent via Firebase Cloud Messaging (FCM) to mobile devices when:
  - Budget/category thresholds are crossed
  - Monthly and yearly reports are ready
- **Notification Details:** Each notification includes a direct link to the relevant breakdown or report endpoint for quick access.
- **Notification Storage:** All notifications are stored in the database and can be retrieved by the user.

### 4. Reporting & Analytics

- **Monthly Reports:** Automatically generated and notified to users on the 1st of each month, with detailed breakdowns of income, expenses, and category usage.
- **Yearly Reports:** Generated and notified on the 1st of each year, summarizing annual financial activity.
- **Custom Reports:** Endpoints available for users to fetch custom date-range reports.

### 5. Stripe Subscription Management

- **Plan Management:**
  - Create, update, delete, and list subscription plans (products/prices) via Stripe API.
  - Supports recurring billing (monthly/yearly) and custom pricing.
- **Checkout Sessions:**
  - Create Stripe checkout sessions for users to subscribe to plans.
  - Handles success/cancel redirects and webhook integration for subscription events.
- **Admin Controls:** Only admins can create, edit, or delete plans.

### 6. File Uploads

- **Multer Integration:** Secure file uploads for receipts, profile images, etc.
- **Static File Serving:** Uploaded files are served via Express static middleware.

### 7. Data Validation & Error Handling

- **Zod & Mongoose Validation:** All input is validated at both the API and database level.
- **Centralized Error Handling:** Consistent error responses and logging for all endpoints.

### 8. Logging & Monitoring

- **Winston Logger:** Logs all errors and important events, with daily file rotation.
- **Morgan:** HTTP request logging for API monitoring.

### 9. Email Service

- **NodeMailer:** Send transactional emails (e.g., password reset, notifications) via SMTP.

### 10. Real-time Updates

- **Socket.io:** Real-time updates for notifications, transactions, and more.

### 11. Web Scraping (Price Comparison)

- **Compare Prices:**
  - Scrape product prices from multiple e-commerce sites (e.g., Amazon, eBay, etc.)
  - Compare and display the best prices for a given product.
- **Endpoints:**
  - `/api/v1/compare-price` — Submit a product to compare prices across supported sites.
  - Results are returned with links to the best offers.

### 12. Environment & Configuration

- **.env Support:** All sensitive config (DB, JWT, FCM, Stripe, etc.) is managed via environment variables.

### 13. Testing

- **Automated Tests:** Easily run tests with `npm test`.

---

## Notification System (How it Works)

1. **Threshold Notifications:**

- When a user crosses 50%, 75%, 90%, or 100% of their monthly budget, or 80%/100% of a category budget, a notification is created and a push notification is sent (if the user has an FCM token).
- Notifications include a direct link to the details endpoint for instant breakdown.

2. **Monthly/Yearly Reports:**

- On the 1st of each month/year, users receive a notification that their report is ready, with a link to the report details.

3. **Push Notification Delivery:**

- Uses Firebase Cloud Messaging (FCM). The mobile app must register and send its FCM token to the backend.
- Notifications are also delivered in real time via Socket.io for web clients.

4. **Notification Storage:**

- All notifications are stored in the database and can be fetched via the notifications API.

## Stripe Subscription API (Endpoints)

- `POST /api/v1/create-checkout-session/create-plan` — Create a new subscription plan (admin only)
- `PATCH /api/v1/create-checkout-session/edit-plan/:productId` — Edit a plan (admin only)
- `DELETE /api/v1/create-checkout-session/delete-plan/:productId` — Delete a plan (admin only)
- `GET /api/v1/create-checkout-session/plans` — List all available plans
- `POST /api/v1/create-checkout-session/` — Create a checkout session for a plan (user)

All endpoints require authentication. Admin privileges are required for plan management.

## Tech Stack

- Typescript
- Node.js
- Express
- Mongoose
- Bcrypt
- JWT
- NodeMailer
- Multer
- ESLint
- Prettier
- Winston
- Daily-winston-rotate-file
- Morgen
- Socket

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Ensure you have the following installed:

- Node.js
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/your-repository.git
   cd your-repository
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

   Using yarn:

   ```bash
   yarn install
   ```

3. **Create a `.env` file:**

   In the root directory of the project, create a `.env` file and add the following variables. Adjust the values according to your setup.

   ```env
   # Basic
   NODE_ENV=development
   DATABASE_URL=mongodb://127.0.0.1:27017/project_name
   IP_ADDRESS=192.0.0.0
   PORT=5000

   # Bcrypt
   BCRYPT_SALT_ROUNDS=12

   # JWT
   JWT_SECRET=jwt_secret
   JWT_EXPIRE_IN=1d

   # Email
   EMAIL_FROM=email@gmail.com
   EMAIL_USER=email@gmail.com
   EMAIL_PASS=mkqcfjeqloothyax
   EMAIL_PORT=587
   EMAIL_HOST=smtp.gmail.com
   ```

4. **Run the project:**

   Using npm:

   ```bash
   npm run dev
   ```

   Using yarn:

   ```bash
   yarn run dev
   ```

### Running the Tests

Explain how to run the automated tests for this system.

```bash
npm test
```

# Web Scraping & Price Comparison

The backend includes a price comparison module that scrapes prices from multiple e-commerce sites. Users can submit a product name or URL, and the system will return the best prices found, with direct links to purchase.

---

