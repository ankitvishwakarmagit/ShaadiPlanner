import mongoose from "mongoose"

// OTP Schema - keyed by email instead of phone for email-based OTP delivery
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Must be a valid email address"],
    },
    otpCode: {
      type: String,
      required: [true, "OTP code is required"],
      match: [/^\d{6}$/, "OTP must be a 6-digit code"],
    },
    role: { type: String, enum: ["user", "vendor", "admin"], required: [true, "Role is required"] },
    expiresAt: { type: Date, required: [true, "Expiration time is required"], index: { expireAfterSeconds: 0 } },
    requestCount: { type: Number, default: 0 },
    lastRequestTime: { type: Date, default: Date.now },
    resetToken: { type: String },
    verified: { type: Boolean, default: false },
  },
  { indexes: [{ key: { email: 1, role: 1 }, unique: true }], timestamps: true },
)

export default mongoose.model("OTP", otpSchema)
