import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "Web Development"
    },
    price: {
      type: Number,
      required: true,
    },
    deliveryTime: {
      type: String,
      default: "3 days"
    },
    skills: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "paused", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Gig = mongoose.model("Gig", gigSchema);

export default Gig;
