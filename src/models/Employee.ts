import mongoose from "mongoose";
import crypto from "crypto";

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

    virtualSignature: {
      type: String,
      unique: true,
      sparse: true,
      default: () => crypto.randomUUID(), // Genera un UUID único
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

    faceDescriptorHash: {
      type: String,
      unique: true,     
      sparse: true,    
    },

    absenceCount: { type: Number, default: 0 },
    consecutiveAbsenceCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);


// Middleware pre-save para calcular el hash automáticamente
EmployeeSchema.pre('save', function(next) {
  if (this.faceDescriptor && this.isModified('faceDescriptor')) {
    const descriptorString = JSON.stringify(this.faceDescriptor);
    this.faceDescriptorHash = crypto.createHash('sha256').update(descriptorString).digest('hex');
  }
  next();
});

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);   