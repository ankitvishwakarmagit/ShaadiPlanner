import User from "../models/User.js"
import BlockedUsers from "../models/BlockedUsers.js"
import OTP from "../models/OTP.js"
import { sendOTPEmail, sendNotificationEmail, sendWelcomeEmail } from "../utils/mailer.js"
import { generateToken } from "../middleware/auth.js"
import { NODE_ENV } from "../config/env.js"
import bcrypt from "bcrypt"
import { normalizeIndianPhone } from "../utils/phoneValidator.js"

export const signIn = async (req, res) => {
  const { email } = req.body

  if (!email) return res.status(400).json({ message: "Email is required" })

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) return res.status(404).json({ message: "User not found" })

    const isBlocked = await BlockedUsers.findOne({ phone: user.phone })
    if (isBlocked) return res.status(403).json({ message: "User is blocked" })

    const otpRecord = await OTP.findOne({ email: normalizedEmail, role: "user" })
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
      { email: normalizedEmail, role: "user" },
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
    const response = { message: "OTP sent successfully" }
    if (NODE_ENV !== "production") response.otp = otp
    res.status(200).json(response)
  } catch (error) {
    console.error("User sign-in error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const verifySignInOtp = async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" })

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) return res.status(404).json({ message: "User not found" })

    const otpRecord = await OTP.findOne({ email: normalizedEmail, otpCode: otp, role: "user" })
    if (!otpRecord || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    if (otpRecord.verified) {
      return res.status(400).json({ message: "OTP has already been used" })
    }

    otpRecord.verified = true
    await otpRecord.save()

    // Generate token with user's actual role (user or vendor)
    const token = await generateToken(user._id, user.role)
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
        user: { id: user._id, email: user.email, phone: user.phone, username: user.username, role: user.role },
      })

    await OTP.deleteOne({ _id: otpRecord._id })
    await sendWelcomeEmail(user.email, user.full_name)
  } catch (error) {
    console.error("User OTP verify error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const signUp = async (req, res) => {
  const { full_name, phone, email } = req.body
  const normalizedPhone = normalizeIndianPhone(phone)
  const normalizedEmail = email?.toLowerCase().trim()

  if (!full_name || !phone || !email)
    return res.status(400).json({ message: "Full name, phone, and email are required" })
  if (!normalizedPhone) return res.status(400).json({ message: "Invalid Indian phone number" })
  if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail))
    return res.status(400).json({ message: "Invalid email address" })

  try {
    const existingByPhone = await User.findOne({ phone: normalizedPhone })
    if (existingByPhone) return res.status(400).json({ message: "Phone number already registered" })

    const existingByEmail = await User.findOne({ email: normalizedEmail })
    if (existingByEmail) return res.status(400).json({ message: "Email already registered" })

    const otpRecord = await OTP.findOne({ email: normalizedEmail, role: "user" })
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
      { email: normalizedEmail, role: "user" },
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
    const response = { message: "OTP sent successfully", full_name }
    if (NODE_ENV !== "production") response.otp = otp
    res.status(200).json(response)
  } catch (error) {
    console.error("User sign-up error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const verifySignUpOtp = async (req, res) => {
  const { full_name, phone, email, otp } = req.body
  const normalizedPhone = normalizeIndianPhone(phone)
  const normalizedEmail = email?.toLowerCase().trim()

  if (!full_name || !phone || !email || !otp)
    return res.status(400).json({ message: "Full name, phone, email, and OTP are required" })
  if (!normalizedPhone) return res.status(400).json({ message: "Invalid Indian phone number" })

  try {
    const otpRecord = await OTP.findOne({ email: normalizedEmail, otpCode: otp, role: "user" })
    if (!otpRecord || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    if (otpRecord.verified) {
      return res.status(400).json({ message: "OTP has already been used" })
    }

    otpRecord.verified = true
    await otpRecord.save()

    const username = `user${normalizedPhone.replace("+", "")}` // e.g., +919876543210 -> user919876543210
    const user = await User.create({
      full_name,
      phone: normalizedPhone,
      email: normalizedEmail,
      username,
      role: "user",
    })

    const token = await generateToken(user._id, "user")
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "Registration successful",
        user: { id: user._id, email: user.email, phone: user.phone, username: user.username, role: user.role },
      })

    await OTP.deleteOne({ _id: otpRecord._id })
  } catch (error) {
    console.error("User sign-up OTP verify error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const registerVendor = async (req, res) => {
  const { phone, password, vendorRequest, brand_icon } = req.normalizedBody

  if (!phone || !password || !vendorRequest?.category) {
    return res.status(400).json({
      message: "Phone, password, and vendor category are required",
      missing: { phone: !phone, password: !password, category: !vendorRequest?.category },
    })
  }
  if (!/^\+91[6-9]\d{9}$/.test(phone)) return res.status(400).json({ message: "Invalid Indian phone number. Must be 10 digits starting with 6, 7, 8, or 9 with +91 prefix." })
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" })

  // Use vendorRequest.email as the OTP delivery address
  const otpEmail = vendorRequest?.email?.toLowerCase().trim()
  if (!otpEmail || !/^\S+@\S+\.\S+$/.test(otpEmail))
    return res.status(400).json({ message: "A valid email is required in vendor details for OTP verification" })

  if (!brand_icon) return res.status(400).json({ message: "Brand icon is required" })
  const maxSize = 250 * 1024
  if (brand_icon.size > maxSize) return res.status(400).json({ message: "Brand icon must be less than 250KB" })
  const allowedFormats = ["image/jpeg", "image/jpg", "image/png"]
  if (!allowedFormats.includes(brand_icon.mimetype))
    return res.status(400).json({ message: "Brand icon must be JPEG, JPG, or PNG" })

  try {
    const isBlocked = await BlockedUsers.findOne({ phone })
    if (isBlocked) return res.status(403).json({ message: "User is blocked" })

    const user = await User.findOne({ phone })
    if (user) {
      if (user.vendorRequest.status === "pending")
        return res.status(400).json({ message: "Vendor request already pending" })
      if (user.vendorRequest.status === "approved") return res.status(400).json({ message: "Already a vendor" })
      if (user.vendorRequest.rejectionCount >= 3) {
        const cooldownEnd = new Date(user.vendorRequest.lastRejectionTime.getTime() + 7 * 24 * 60 * 60 * 1000)
        if (new Date() < cooldownEnd) {
          const daysLeft = Math.ceil((cooldownEnd - new Date()) / (24 * 60 * 60 * 1000))
          return res.status(429).json({ message: `Too many rejections. Please wait ${daysLeft} days.` })
        } else {
          user.vendorRequest.rejectionCount = 0 // Reset after cooldown
        }
      }
      if (vendorRequest.full_name && vendorRequest.full_name !== user.full_name) {
        return res.status(400).json({ message: `Please use your existing full name: ${user.full_name}` })
      }
    }

    const otpRecord = await OTP.findOne({ email: otpEmail, role: "vendor" })
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
      { email: otpEmail, role: "vendor" },
      {
        otpCode: otp,
        expiresAt,
        requestCount: (otpRecord?.requestCount || 0) + 1,
        lastRequestTime: now,
        verified: false,
        resetToken: brand_icon.data.toString("base64"), // Store brand icon temporarily
      },
      { upsert: true },
    )

    await sendOTPEmail(otpEmail, otp)
    res.status(200).json({ message: "OTP sent successfully", phone, password, vendorRequest })
  } catch (error) {
    console.error("Vendor register error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const verifyVendorOtp = async (req, res) => {
  const { phone, otp, password, vendorRequest } = req.normalizedBody

  if (!phone || !otp || !password || !vendorRequest || !vendorRequest.category) {
    return res.status(400).json({
      message: "All fields are required",
      missing: {
        phone: !phone,
        otp: !otp,
        password: !password,
        category: !vendorRequest?.category,
      },
    })
  }
  if (vendorRequest.terms_accepted !== true) return res.status(400).json({ message: "Terms must be accepted" })

  const otpEmail = vendorRequest?.email?.toLowerCase().trim()
  if (!otpEmail) return res.status(400).json({ message: "Vendor email is required for OTP verification" })

  try {
    const otpRecord = await OTP.findOne({ email: otpEmail, otpCode: otp, role: "vendor" })
    if (!otpRecord || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }

    if (otpRecord.verified) {
      return res.status(400).json({ message: "OTP has already been used" })
    }

    // Normalize the category value to match the enum in the schema
    if (vendorRequest.category) {
      const categoryMap = {
        "wedding-venues": "Wedding Venues",
        "photographers": "Photographers",
        "bridal-makeup": "Bridal Makeup",
        "henna-artists": "Henna Artists",
        "bridal-wear": "Bridal Wear",
        "car-rental": "Car Rental",
        "wedding-cards": "Wedding Cards",
        "wedding-invitations": "Wedding Invitations"
      };

      const normalizedCategory = vendorRequest.category.toLowerCase().replace(/\s+/g, '-');
      vendorRequest.category = categoryMap[normalizedCategory] || vendorRequest.category;
    }

    otpRecord.verified = true
    await otpRecord.save()

    let user = await User.findOne({ phone })
    const hashedPassword = await bcrypt.hash(password, 10)
    let brandIconUrl

    if (otpRecord.resetToken) {
      const brandIconBuffer = Buffer.from(otpRecord.resetToken, "base64")
      const brandIconData = {
        buffer: brandIconBuffer,
        mimetype: req.normalizedBody.brand_icon?.mimetype || "image/jpeg",
      }
      brandIconUrl = await uploadBrandIcon(brandIconData)
    } else {
      return res.status(400).json({ message: "Brand icon data missing from OTP record" })
    }

    const username = `user${phone.replace("+", "")}` // e.g., +919876543210 -> user919876543210

    if (user) {
      if (user.vendorRequest.status === "approved") return res.status(400).json({ message: "Already a vendor" })
      if (vendorRequest.full_name && vendorRequest.full_name !== user.full_name) {
        return res.status(400).json({ message: `Please use your existing full name: ${user.full_name}` })
      }
      // Update existing user
      user.username = username
      // Ensure email is set on existing user record if missing
      if (!user.email) user.email = otpEmail
      user.vendorRequest = {
        ...vendorRequest,
        brand_icon: brandIconUrl,
        status: "pending",
        terms_accepted: true,
        submittedAt: new Date(),
      }
      user.password = hashedPassword
      await user.save()
    } else {
      // Create new user
      user = await User.create({
        phone,
        email: otpEmail,
        username,
        full_name: vendorRequest.full_name || phone.slice(-10),
        password: hashedPassword,
        role: "user", // Remains 'user' until approved
        vendorRequest: {
          ...vendorRequest,
          brand_icon: brandIconUrl,
          status: "pending",
          terms_accepted: true,
          submittedAt: new Date(),
        },
      })
    }

    await OTP.deleteOne({ _id: otpRecord._id })
    res.status(200).json({ message: "Vendor request submitted successfully, awaiting approval" })
  } catch (error) {
    console.error("Vendor OTP verify error:", error)
    res.status(500).json({ message: "Server error", details: error.message })
  }
}
