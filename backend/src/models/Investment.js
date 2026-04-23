import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
      maxlength: 3,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    notes: { type: String, trim: true, maxlength: 1200 },
  },
  { timestamps: true }
);

investmentSchema.index({ investor: 1, transactionDate: -1 });
investmentSchema.index({ project: 1, transactionDate: -1 });

export default mongoose.models.Investment || mongoose.model("Investment", investmentSchema);
