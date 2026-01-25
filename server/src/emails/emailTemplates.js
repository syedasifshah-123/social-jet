// WELCOME EMAIL TEMPLATE
export const createWelcomeEmailTemplate = (name, clientURL) => `
  <h1>Welcome, ${name} 🎉</h1>
  <p>Thanks for joining Chatify!</p>
  <p><a href="${clientURL}">Get Started</a></p>
`;




// VERIFY OTP EMAIL TEMPLATE
export const createVerifyOtpEmailTemplate = (name, otp) => `
  <h1>Hello, ${name}</h1>
  <p>Your verification OTP is:</p>
  <h2>${otp}</h2>
  <p>This OTP will expire in 5 minutes.</p>
`;



// RESET PASSWORD OTP EMAIL TEMPLATE
export const createResetPasswordOtpEmailTemplate = (name, otp) => `
  <h1>Password Reset Request</h1>
  <p>Hi ${name}, use the OTP below to reset your password:</p>
  <h2>${otp}</h2>
  <p>This OTP will expire in 5 minutes.</p>
`;



// PASSWORD UPDATE EMAIL TEMPLATE
export const passwordUpdatedEmailTemplate = (name) => `
  <h1>Password Updated Successfully ✅</h1>
  <p>Hi ${name}, your password has been updated.</p>
  <p>If you did not perform this action, please contact support immediately.</p>
`;