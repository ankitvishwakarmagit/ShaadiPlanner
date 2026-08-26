import { Admin } from "../models/Admin.js"
import User from "../models/User.js"
import OTP from "../models/OTP.js"
import { sendOTPEmail, sendNotificationEmail } from "../utils/mailer.js"
import { generateToken, generateResetToken } from "../middleware/auth.js"
import bcrypt from "bcrypt"
import { NODE_ENV } from "../config/env.js"

export const login = async (req, res) => {
  const { identifier, password } = req.body

  if (!identifier || !password) return res.status(400).json({ message: "Username/email and password are required" })

  try {
    const admin = await Admin.findOne({ $or: [{ username: identifier }, { email: identifier.toLowerCase().trim() }] })
    if (!admin) return res.status(404).json({ message: "Admin not found" })

    //////i have to change the comparison using bcrypt 
    const isMatch = password === admin.password
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" })

    const token = await generateToken(admin._id, "admin")
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Login successful",
        admin: { id: admin._id, email: admin.email, username: admin.username, role: admin.role },
      })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const requestOtp = async (req, res) => {
  const { email } = req.body

  if (!email) return res.status(400).json({ message: "Email is required" })
  const normalizedEmail = email.toLowerCase().trim()

  try {
    const admin = await Admin.findOne({ email: normalizedEmail })
    if (!admin) return res.status(404).json({ message: "Admin not found" })

    const otpRecord = await OTP.findOne({ email: normalizedEmail, role: "admin" })
    const now = new Date()
    if (otpRecord && otpRecord.requestCount >= 5) {
      const cooldownEnd = new Date(otpRecord.lastRequestTime.getTime() + 15 * 60 * 1000)
      if (now < cooldownEnd) {
        const waitTime = Math.ceil((cooldownEnd - now) / 60000)
        return res.status(429).json({ message: `Too many requests. Please wait ${waitTime} minutes.` })
      } else {
        otpRecord.requestCount = 0
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await OTP.findOneAndUpdate(
      { email: normalizedEmail, role: "admin" },
      {
        otpCode: otp,
        expiresAt,
        requestCount: (otpRecord?.requestCount || 0) + 1,
        lastRequestTime: now,
        verified: false,
      },
      { upsert: true },
    )

    await sendOTPEmail(normalizedEmail, otp)
    res.status(200).json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("Admin OTP request error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" })
  const normalizedEmail = email.toLowerCase().trim()

  try {
    const otpRecord = await OTP.findOne({ email: normalizedEmail, otpCode: otp, role: "admin" })
    if (!otpRecord || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    if (otpRecord.verified) {
      return res.status(400).json({ message: "OTP has already been used" })
    }

    otpRecord.verified = true
    await otpRecord.save()

    const token = generateResetToken(otpRecord._id, "10m")
    res
      .cookie("resetToken", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000,
      })
      .status(200)
      .json({ message: "OTP verified successfully" })
  } catch (error) {
    console.error("Admin OTP verify error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const resetPassword = async (req, res) => {
  const { newPassword } = req.body

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" })
  }

  try {
    const { otpId } = req
    const otpRecord = await OTP.findById(otpId)
    if (!otpRecord || !otpRecord.verified || otpRecord.role !== "admin") {
      return res.status(400).json({ message: "Invalid or unverified OTP" })
    }

    const admin = await Admin.findOne({ phone: otpRecord.phone })
    if (!admin) return res.status(404).json({ message: "Admin not found" })

    admin.password = await bcrypt.hash(newPassword, 10)
    await admin.save()

    res.clearCookie("resetToken").status(200).json({ message: "Password reset successfully" })
    await OTP.deleteOne({ _id: otpRecord._id })
  } catch (error) {
    console.error("Admin reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const checkResetToken = async (req, res) => {
  try {
    const { otpId } = req
    const otpRecord = await OTP.findById(otpId)
    if (!otpRecord || !otpRecord.verified || otpRecord.role !== "admin") {
      return res.status(401).json({ message: "Invalid or unverified reset token" })
    }
    res.status(200).json({ message: "Token valid" })
  } catch (error) {
    console.error("Check reset token error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const approveVendor = async (req, res) => {
  const { userId } = req.body

  try {
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })
    if (user.vendorRequest.status !== "pending") {
      return res.status(400).json({ message: "No pending vendor request" })
    }

    user.role = "vendor"
    user.vendorRequest.status = "approved"
    user.vendorDetails = { ...user.vendorRequest } // Copy vendorRequest to vendorDetails
    delete user.vendorRequest.rejectionCount // Clean up unnecessary fields
    delete user.vendorRequest.lastRejectionTime
    await user.save()

    await sendNotificationEmail(user.email || user.vendorRequest?.email, "Congratulations! You have been registered as a vendor on EazyWed.")
    res.status(200).json({ message: "Vendor approved successfully" })
  } catch (error) {
    console.error("Vendor approval error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const rejectVendor = async (req, res) => {
  const { userId } = req.body

  try {
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })
    if (user.vendorRequest.status !== "pending") {
      return res.status(400).json({ message: "No pending vendor request" })
    }

    user.vendorRequest.status = "canApply"
    user.vendorRequest.rejectionCount = (user.vendorRequest.rejectionCount || 0) + 1
    user.vendorRequest.lastRejectionTime = new Date()
    await user.save()

    await sendNotificationEmail(user.email || user.vendorRequest?.email, "Your vendor request does not meet the standards. Please try again with correct details.")
    res.status(200).json({ message: "Vendor request rejected" })
  } catch (error) {
    console.error("Vendor rejection error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
