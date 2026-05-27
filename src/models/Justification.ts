import mongoose from "mongoose";

const JustificationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },

    type: {
      type: String,
      enum: ["SCHOOL", "HEALTH", "OTHER"],
    },

    reason: String,

    justifiedDay: {
      type: Boolean,
      default: true,
    },

    justifiedHours: {
      type: Boolean,
      default: false,
    },

    fileUrl: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Justification ||
  mongoose.model(
    "Justification",
    JustificationSchema
  );