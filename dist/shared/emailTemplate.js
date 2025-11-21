"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplate = void 0;
const createAccount = (values) => {
    const data = {
        to: values.email,
        subject: 'Verify your Income Expense Tracker account',
        html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/rwrrm7R8/logo.png" alt="Income Expense Tracker Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px; text-align:center;">Welcome, ${values.name}! </h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5; text-align:center; margin-bottom: 20px;">
          Use the following one-time code to verify your account:
        </p>
        <div style="background-color: #277E16; width: 100px; padding: 12px; text-align: center; border-radius: 8px; color: #fff; font-size: 26px; font-weight:bold; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
        <p style="color: #555; font-size: 14px; line-height: 1.5; text-align:center; margin-bottom: 20px;">
          This code is valid for <strong>3 minutes</strong>. Please complete your verification soon.
        </p>
    </div>
</body>`,
    };
    return data;
};
const resetPassword = (values) => {
    const data = {
        to: values.email,
        subject: 'Reset your Income Expense Tracker password',
        html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/rwrrm7R8/logo.png" alt="Income Expense Tracker Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <h2 style="color: #277E16; font-size: 22px; margin-bottom: 20px; text-align:center;">Reset Your Password 🔑</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.5; text-align:center; margin-bottom: 20px;">
          Use the following one-time code to reset your password:
        </p>
        <div style="background-color: #277E16; width: 100px; padding: 12px; text-align: center; border-radius: 8px; color: #fff; font-size: 26px; font-weight:bold; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
        <p style="color: #555; font-size: 14px; line-height: 1.5; text-align:center; margin-bottom: 20px;">
          This code is valid for <strong>3 minutes</strong>.
        </p>
        <p style="color: #999; font-size: 13px; line-height: 1.5; margin-top: 20px; text-align:left;">
          If you didn’t request this reset, please ignore this email. Someone else may have entered your email address by mistake.
        </p>
    </div>
</body>`,
    };
    return data;
};
const sendOtp = (values) => {
    return {
        to: values.email,
        subject: 'Your OTP Code',
        html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <img src="https://i.postimg.cc/rwrrm7R8/logo.png" alt="Income Expense Tracker Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 22px; margin-bottom: 20px; text-align:center;">Your One-Time Passcode</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5; text-align:center; margin-bottom: 20px;">
            Use the following code to proceed:
          </p>
          <div style="background-color: #277E16; width: 100px; padding: 12px; text-align: center; border-radius: 8px; color: #fff; font-size: 26px; font-weight:bold; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
          <p style="color: #555; font-size: 14px; line-height: 1.5; text-align:center; margin-bottom: 20px;">
            This code is valid for <strong>3 minutes</strong>.
          </p>
      </div>
    </body>`,
    };
};
exports.emailTemplate = {
    createAccount,
    resetPassword,
    sendOtp,
};
