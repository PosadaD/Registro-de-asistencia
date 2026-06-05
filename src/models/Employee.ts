import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: String,

    rfc: String,
    shortRfc: String,
    curp: String,

    faceDescriptor: {
      type: [Number], // Array de números (Float32Array convertido)
      required: false,
      index: true,
    },

    immediateBoss: String,
    educationalInstitution: String,
    semester: String,

    providerType: String,
    economicSupport: Boolean,

    startDate: { type: Date, required: true },
    endDate: Date,

    workSchedule: {
      startTime: String,
      endTime: String,
    },

    photo: String,

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "DISMISSED",
        "VOLUNTARY_LEAVE",
        "OTHER",
        "FINISHED",
      ],
      default: "ACTIVE",
    },

    absenceCount: { type: Number, default: 0 },
    consecutiveAbsenceCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);   