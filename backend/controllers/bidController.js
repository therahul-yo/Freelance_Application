import Bid from "../models/bidModel.js";
import Project from "../models/projectModel.js";
import Notification from "../models/notificationModel.js";

const populateBid = (query) =>
  query
    .populate("freelancer", "name email rating numReviews profile")
    .populate("project", "title budget budgetType budgetMin budgetMax status client");

// @desc    Create a bid
// @route   POST /api/bids
// @access  Private
const createBid = async (req, res) => {
  const { project, amount, proposal, deliveryTime } = req.body;

  try {
    if (req.user.role !== "freelancer") {
      res.status(403);
      throw new Error("Only freelancers can submit proposals");
    }

    if (!project || !proposal?.trim() || !amount) {
      res.status(400);
      throw new Error("Project, amount, and proposal are required");
    }

    const projectRecord = await Project.findById(project);

    if (!projectRecord) {
      res.status(404);
      throw new Error("Project not found");
    }

    if (projectRecord.status !== "open") {
      res.status(400);
      throw new Error("This project is not accepting new proposals");
    }

    if (projectRecord.client.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot submit a proposal to your own project");
    }

    // Check if user already bid on this project
    const existingBid = await Bid.findOne({ project, freelancer: req.user._id });
    if (existingBid) {
      res.status(400);
      throw new Error("You have already submitted a proposal for this project");
    }

    const bid = await Bid.create({
      project,
      freelancer: req.user._id,
      amount: Number(amount),
      proposal: proposal.trim(),
      deliveryTime,
      status: "pending"
    });

    // Update project bidsCount
    await Project.findByIdAndUpdate(project, { $inc: { bidsCount: 1 } });

    // Create notification for project owner
    await Notification.create({
      recipient: projectRecord.client,
      sender: req.user._id,
      type: "bid",
      content: `${req.user.name} submitted a new proposal for your project: ${projectRecord.title}`,
      link: `/jobs/${projectRecord._id}`,
    });

    const populatedBid = await populateBid(Bid.findById(bid._id));
    res.status(201).json(populatedBid);
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
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    if (project.client.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the project owner can view all proposals");
    }

    const bids = await populateBid(
      Bid.find({ project: req.params.projectId }).sort({ createdAt: -1 })
    );
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
    const bids = await populateBid(
      Bid.find({ freelancer: req.user._id }).sort({ createdAt: -1 })
    );
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
    const bid = await Bid.findById(req.params.id).populate("project");
    if (!bid) {
      res.status(404);
      throw new Error("Bid not found");
    }

    if (bid.project.client.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the project owner can accept a proposal");
    }

    if (bid.project.status !== "open") {
      res.status(400);
      throw new Error("This project is no longer accepting proposals");
    }

    bid.status = "accepted";
    await bid.save();

    // Update project status and assign freelancer
    await Project.findByIdAndUpdate(bid.project._id, {
      status: "in-progress",
      assignedFreelancer: bid.freelancer
    });

    // Reject other bids
    await Bid.updateMany(
      { project: bid.project, _id: { $ne: bid._id } },
      { status: "rejected" }
    );

    // Create notification for freelancer
    await Notification.create({
      recipient: bid.freelancer,
      sender: req.user._id,
      type: "acceptance",
      content: `Your proposal for "${bid.project.title}" has been accepted!`,
      link: `/jobs/${bid.project._id}`,
    });

    const acceptedBid = await populateBid(Bid.findById(bid._id));
    res.json(acceptedBid);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Reject a bid
// @route   PUT /api/bids/:id/reject
// @access  Private
const rejectBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("project");
    if (!bid) {
      res.status(404);
      throw new Error("Bid not found");
    }

    if (bid.project.client.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the project owner can reject a proposal");
    }

    if (bid.status !== "pending") {
      res.status(400);
      throw new Error("Can only reject pending proposals");
    }

    bid.status = "rejected";
    await bid.save();

    await Notification.create({
      recipient: bid.freelancer,
      sender: req.user._id,
      type: "bid",
      content: `Your proposal for "${bid.project.title}" was not selected.`,
      link: `/jobs/${bid.project._id}`,
    });

    const rejectedBid = await populateBid(Bid.findById(bid._id));
    res.json(rejectedBid);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Withdraw a bid (freelancer)
// @route   DELETE /api/bids/:id
// @access  Private
const withdrawBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("project");
    if (!bid) {
      res.status(404);
      throw new Error("Bid not found");
    }

    if (bid.freelancer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You can only withdraw your own proposals");
    }

    if (bid.status !== "pending") {
      res.status(400);
      throw new Error("Can only withdraw pending proposals");
    }

    await Bid.findByIdAndDelete(req.params.id);
    await Project.findByIdAndUpdate(bid.project._id, { $inc: { bidsCount: -1 } });

    res.json({ message: "Proposal withdrawn" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { createBid, getProjectBids, getMyBids, acceptBid, rejectBid, withdrawBid };
