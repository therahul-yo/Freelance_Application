import Review from "../models/reviewModel.js";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  const { projectId, rating, comment } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    if (project.status !== "completed") {
      res.status(400);
      throw new Error("Can only review completed projects");
    }

    // Only the client can leave a review for the freelancer
    const isClient = project.client.toString() === req.user._id.toString();

    if (!isClient) {
      res.status(403);
      throw new Error("Only the client can leave a review for a completed project");
    }

    // The freelancer is being reviewed
    const revieweeId = project.assignedFreelancer;

    // Check if review already exists from this reviewer for this project
    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      res.status(400);
      throw new Error("You have already reviewed this project");
    }

    const review = await Review.create({
      project: projectId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: Number(rating),
      comment,
    });

    // Update reviewee's rating and numReviews
    const user = await User.findById(revieweeId);
    if (user) {
      const allReviews = await Review.find({ reviewee: revieweeId });
      const avgRating =
        allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
      user.rating = avgRating;
      user.numReviews = allReviews.length;
      await user.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { createReview, getUserReviews };
