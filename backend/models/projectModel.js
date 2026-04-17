import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "Web Development"
    },
    budget: {
      type: Number,
      required: true,
      min: 1,
    },
    budgetType: {
      type: String,
      enum: ["fixed", "hourly"],
      default: "fixed"
    },
    budgetMin: {
      type: Number,
    },
    budgetMax: {
      type: Number,
    },
    experienceLevel: {
      type: String,
      enum: ["Entry Level", "Intermediate", "Expert"],
      default: "Intermediate"
    },
    duration: {
      type: String,
      default: "1 to 3 months"
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "delivered", "completed", "cancelled"],
      default: "open",
    },
    skillsRequired: [{ type: String }],
    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sourceGig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
    },
    bidsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
