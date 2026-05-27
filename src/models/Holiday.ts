import mongoose from "mongoose";

const HolidaySchema = new mongoose.Schema(
  {
    name: String,

    date: Date,

    custom: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Holiday ||
  mongoose.model("Holiday", HolidaySchema);