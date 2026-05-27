import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    date: Date,

    checkIn: String,
    checkOut: String,

    workedHours: {
      type: Number,
      default: 0,
    },

    extraHours: {
      type: Number,
      default: 0,
    },

    isLate: {
      type: Boolean,
      default: false,
    },

    isAbsent: {
      type: Boolean,
      default: false,
    },

    isPartialAbsence: {
      type: Boolean,
      default: false,
    },

    needsReview: {
      type: Boolean,
      default: false,
    },

    justified: {
      type: Boolean,
      default: false,
    },

    method: {
      type: String,
      default: "code",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);