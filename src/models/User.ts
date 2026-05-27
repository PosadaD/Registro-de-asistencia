import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["ADMIN", "VIEWER"], default: "VIEWER" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);