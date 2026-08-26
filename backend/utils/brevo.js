import nodemailer from "nodemailer"
import {
  EMAIL_PASS,
  EMAIL_USER,
  GMAIL_PASS,
  GMAIL_USER,
  SMTP_PASS,
  SMTP_USER,
  SENDER_EMAIL,
} from "../config/env.js"

const smtpUser = SMTP_USER || GMAIL_USER || EMAIL_USER
const smtpPass = SMTP_PASS || GMAIL_PASS || EMAIL_PASS
const senderEmail = SENDER_EMAIL || smtpUser

const getTransporter = () => {
  if (!smtpUser || !smtpPass || !senderEmail) {
    throw new Error("SMTP_USER and SMTP_PASS must be configured in backend/.env")
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  })
}

const sendEmail = async ({ to, subject, htmlContent }) => {
  return getTransporter().sendMail({
    from: senderEmail,
    to,
    subject,
    html: htmlContent,
  })
}

export const verifyEmailTransport = async () => getTransporter().verify()

/**
 * Sends an OTP email via Gmail / SMTP.
 * Falls back to a console log if credentials are not yet configured.
 *
 * @param {string} email - Recipient email address
 * @param {string} otp   - 6-digit OTP code
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    await sendEmail({
      to: email,
      subject: "Your ShaadiPlanner OTP Code",
      htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>EazyWed OTP</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:12px;overflow:hidden;
                       box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#e63b7a,#ff8c42);
                             padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:1px;">
                        ShaadiPlanner
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                      Your Wedding Planning Partner
                    </p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 8px;color:#444;font-size:16px;">Hello,</p>
                    <p style="margin:0 0 28px;color:#666;font-size:15px;line-height:1.6;">
                      Use the OTP below to verify your identity on ShaadiPlanner.
                      This code is valid for <strong>10 minutes</strong>.
                    </p>
                    <!-- OTP Box -->
                    <div style="background:#fdf3f8;border:2px dashed #e63b7a;
                                border-radius:10px;padding:24px;text-align:center;
                                margin-bottom:28px;">
                      <p style="margin:0 0 6px;font-size:13px;color:#999;
                                 text-transform:uppercase;letter-spacing:1px;">
                        One-Time Password
                      </p>
                      <p style="margin:0;font-size:42px;font-weight:700;
                                 letter-spacing:12px;color:#e63b7a;">
                        ${otp}
                      </p>
                    </div>
                    <p style="margin:0;color:#999;font-size:13px;line-height:1.6;">
                      If you did not request this OTP, please ignore this email.
                      Do not share this code with anyone.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#fafafa;padding:20px 40px;text-align:center;
                             border-top:1px solid #eee;">
                    <p style="margin:0;color:#bbb;font-size:12px;">
                      &copy; ${new Date().getFullYear()} ShaadiPlanner. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    })
    console.log(`[Email Sent] OTP successfully sent to ${email}`)
  } catch (error) {
    console.error(`[Email Send Error] Failed to send OTP to ${email}:`, error.response?.body || error.message)
    throw new Error("Unable to send OTP email")
  }
}

export const sendWelcomeEmail = async (email, name) => {
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to ShaadiPlanner",
      htmlContent: `<p>Hello ${name},</p><p>Welcome to ShaadiPlanner. Your account has been created with the email address ${email}.</p><p>Thank you for joining us!</p><p>Best regards,<br>The ShaadiPlanner Team</p>`,
    })
    console.log(`[Email Sent] Welcome email successfully sent to ${email}`)
  } catch (error) {
    console.error(`[Email Send Error] Failed to send welcome email to ${email}:`, error.response?.body || error.message)
    throw new Error("Unable to send welcome email")
  }
}

/**
 * Sends a general notification email via Gmail / SMTP.
 *
 * @param {string} email   - Recipient email address
 * @param {string} message - Plain text or HTML notification message
 */
export const sendNotificationEmail = async (email, message) => {
  try {
    await sendEmail({
      to: email,
      subject: "ShaadiPlanner Notification",
      htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"/></head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:12px;overflow:hidden;
                       box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#e63b7a,#ff8c42);
                             padding:28px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;">ShaadiPlanner</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="margin:0;color:#555;font-size:15px;line-height:1.7;">
                      ${message}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#fafafa;padding:18px 40px;text-align:center;
                             border-top:1px solid #eee;">
                    <p style="margin:0;color:#bbb;font-size:12px;">
                      &copy; ${new Date().getFullYear()} ShaadiPlanner
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    })
    console.log(`[Notification Email Sent] Successfully sent to ${email}`)
  } catch (error) {
    console.error(`[Notification Email Error] Failed to send to ${email}:`, error.response?.body || error.message)
    throw new Error("Unable to send notification email")
  }
}
