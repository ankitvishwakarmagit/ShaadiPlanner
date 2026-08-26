import dotenv from "dotenv";

dotenv.config();

export const {
  MONGO_URI,
  PORT = 5000,
  JWT_SECRET,
  NODE_ENV = "development",
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  FRONTEND_URL = "http://localhost:5173",
  SMTP_USER,
  SMTP_PASS,
  SENDER_EMAIL,
  EMAIL_USER,
  EMAIL_PASS,
  GMAIL_USER,
  GMAIL_PASS,
} = process.env;

// Log to verify env vars are loaded (remove after testing)
console.log("Env Loaded:", {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: CLOUDINARY_API_SECRET ? "[REDACTED]" : undefined,
});