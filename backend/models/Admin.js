import mongoose from "mongoose"

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Must be a valid email address"],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allow null/undefined for existing records
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["superadmin", "moderator"],
      required: [true, "Role is required"],
      default: "superadmin",
    },
  },
  { timestamps: true },
)

export const Admin = mongoose.model("Admin", adminSchema)
