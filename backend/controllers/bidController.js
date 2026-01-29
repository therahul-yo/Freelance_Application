import Bid from "../models/bidModel.js";
import Project from "../models/projectModel.js";

// @desc    Create a bid
// @route   POST /api/bids
// @access  Private
const createBid = async (req, res) => {
  const { project, amount, proposal, deliveryTime } = req.body;

  try {
    // Check if user already bid on this project
    const existingBid = await Bid.findOne({ project, freelancer: req.user._id });
    if (existingBid) {
      res.status(400);
      throw new Error("You have already submitted a proposal for this project");
    }

    const bid = await Bid.create({
      project,
      freelancer: req.user._id,
      amount,
      proposal,
      deliveryTime,
      status: "pending"
    });

    // Update project bidsCount
    await Project.findByIdAndUpdate(project, { $inc: { bidsCount: 1 } });

    res.status(201).json(bid);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get bids for a project
// @route   GET /api/bids/project/:projectId
// @access  Private
const getProjectBids = async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.projectId })
      .populate("freelancer", "name email skills")
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get user's bids
// @route   GET /api/bids/my
// @access  Private
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate("project", "title budget status")
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Accept a bid
// @route   PUT /api/bids/:id/accept
// @access  Private
const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      res.status(404);
      throw new Error("Bid not found");
    }

    bid.status = "accepted";
    await bid.save();

    // Update project status and assign freelancer
    await Project.findByIdAndUpdate(bid.project, {
      status: "in-progress",
      freelancer: bid.freelancer
    });

    // Reject other bids
    await Bid.updateMany(
      { project: bid.project, _id: { $ne: bid._id } },
      { status: "rejected" }
    );

    res.json(bid);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { createBid, getProjectBids, getMyBids, acceptBid };
