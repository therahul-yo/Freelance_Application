import Gig from "../models/gigModel.js";

// @desc    Get all active gigs
// @route   GET /api/gigs
// @access  Public
const getGigs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: "active" };
    
    if (category && category !== "All") {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const gigs = await Gig.find(query)
      .populate("freelancer", "name email")
      .sort({ createdAt: -1 });
    res.json(gigs);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate(
      "freelancer",
      "name email"
    );
    if (gig) {
      res.json(gig);
    } else {
      res.status(404);
      throw new Error("Gig not found");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Create a gig
// @route   POST /api/gigs
// @access  Private (Freelancers only)
const createGig = async (req, res) => {
  const { title, description, category, price, deliveryTime, skills } = req.body;

  try {
    const gig = await Gig.create({
      freelancer: req.user._id,
      title,
      description,
      category: category || "Web Development",
      price,
      deliveryTime: deliveryTime || "3 days",
      skills: skills || [],
    });

    res.status(201).json(gig);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get my gigs
// @route   GET /api/gigs/my
// @access  Private
const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ freelancer: req.user._id }).sort({ createdAt: -1 });
    res.json(gigs);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private
const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      res.status(404);
      throw new Error("Gig not found");
    }

    if (gig.freelancer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const updatedGig = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedGig);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      res.status(404);
      throw new Error("Gig not found");
    }

    if (gig.freelancer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized");
    }

    await Gig.findByIdAndUpdate(req.params.id, { status: "deleted" });
    res.json({ message: "Gig deleted" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { getGigs, getGigById, createGig, getMyGigs, updateGig, deleteGig };
