// models/Justification.ts
import mongoose from "mongoose";

const JustificationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["SCHOOL", "HEALTH", "OTHER"],
      required: true,
    },
    justifiesFullDay: { type: Boolean, default: true },
    justifiesHours: { type: Boolean, default: false },
    startTime: String,
    endTime: String,
    reason: { type: String, required: true },
    fileUrl: String,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Justification ||
  mongoose.model("Justification", JustificationSchema);