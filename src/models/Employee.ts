// models/Employee.ts
import mongoose from "mongoose";
import crypto from "crypto";

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: {
      type: String,
      enum: ["MASCULINO", "FEMENINO", "OTRO"],
      default: "OTRO",
    },

    rfc: String,
    shortRfc: String,
    curp: String,

    immediateBoss: String,
    educationalInstitution: String,
    semester: String,

    providerType: {
      type: String,
      enum: ["INTERNO", "EXTERNO", "SERVICIO_SOCIAL", "PRACTICAS"],
      default: "INTERNO",
    },
    economicSupport: { type: Boolean, default: false },

    startDate: { type: Date, required: true },
    endDate: Date,

    workSchedule: {
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "13:00" },
    },

    photo: String,

    status: {
      type: String,
      enum: ["ACTIVE", "DISMISSED", "VOLUNTARY_LEAVE", "OTHER", "FINISHED"],
      default: "ACTIVE",
    },

    absenceCount: { type: Number, default: 0 },
    consecutiveAbsenceCount: { type: Number, default: 0 },

    faceDescriptor: {
      type: [Number],
      required: false,
      index: true,
    },

    faceDescriptorHash: {
      type: String,
      unique: true,
      sparse: true,
    },

    virtualSignature: {
      type: String,
      unique: true,
      sparse: true,
      default: () => crypto.randomUUID(),
    },
  },
  { timestamps: true }
);

// Middleware asíncrono SIN next()
EmployeeSchema.pre('save', async function() {
  // Si hay faceDescriptor y ha sido modificado, recalcular hash
  if (this.faceDescriptor && this.isModified('faceDescriptor')) {
    const descriptorString = JSON.stringify(this.faceDescriptor);
    this.faceDescriptorHash = crypto.createHash('sha256').update(descriptorString).digest('hex');
  }
  // Al ser async, Mongoose espera a que termine la función
  // No se necesita llamar a next()
});

export default mongoose.models.Employee ||
  mongoose.model("Employee", EmployeeSchema);