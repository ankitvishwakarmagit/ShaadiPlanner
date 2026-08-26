import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true,
    match: [/^\+91[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. +919876543210)"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ContactMessage", contactMessageSchema);