import Gig from "../models/gigModel.js";
import Project from "../models/projectModel.js";
import Notification from "../models/notificationModel.js";

const populateGig = (query) =>
  query.populate("freelancer", "name email rating numReviews profile");

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
        { description: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    const gigs = await populateGig(Gig.find(query).sort({ createdAt: -1 }));
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
    const gig = await populateGig(Gig.findById(req.params.id));
    if (gig) {
      let activeOrder = null;
      if (req.user) {
        const project = await Project.findOne({
          client: req.user._id,
          sourceGig: req.params.id,
          status: { $in: ["in-progress", "delivered"] },
        });
        if (project) {
          activeOrder = project._id;
        }
      }
      res.json({ ...gig.toObject(), activeOrder });
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
    if (req.user.role !== "freelancer") {
      res.status(403);
      throw new Error("Only freelancers can create gigs");
    }

    if (!title?.trim() || !description?.trim() || !price) {
      res.status(400);
      throw new Error("Title, description, and price are required");
    }

    const gig = await Gig.create({
      freelancer: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category || "Web Development",
      price: Number(price),
      deliveryTime: deliveryTime || "3 days",
      skills: Array.isArray(skills)
        ? skills.map((skill) => skill.trim()).filter(Boolean)
        : [],
    });

    const populatedGig = await populateGig(Gig.findById(gig._id));
    res.status(201).json(populatedGig);
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
    const gigs = await populateGig(
      Gig.find({ freelancer: req.user._id }).sort({ createdAt: -1 })
    );
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

    const nextPayload = { ...req.body };
    if (typeof nextPayload.title === "string") nextPayload.title = nextPayload.title.trim();
    if (typeof nextPayload.description === "string") {
      nextPayload.description = nextPayload.description.trim();
    }
    if (Array.isArray(nextPayload.skills)) {
      nextPayload.skills = nextPayload.skills.map((skill) => skill.trim()).filter(Boolean);
    }

    const updatedGig = await populateGig(
      Gig.findByIdAndUpdate(req.params.id, nextPayload, { new: true })
    );
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

// @desc    Purchase a gig
// @route   POST /api/gigs/:id/purchase
// @access  Private
const purchaseGig = async (req, res) => {
  try {
    const gig = await populateGig(Gig.findById(req.params.id));

    if (!gig) {
      res.status(404);
      throw new Error("Gig not found");
    }

    if (gig.freelancer._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot purchase your own gig");
    }

    // Check for existing active order
    const existingProject = await Project.findOne({
      client: req.user._id,
      sourceGig: req.params.id,
      status: { $in: ["in-progress", "delivered"] },
    });

    if (existingProject) {
      res.status(400);
      throw new Error("You already have an active order for this gig");
    }

    // Create a new project based on the gig
    const project = await Project.create({
      client: req.user._id,
      title: gig.title,
      description: gig.description,
      category: gig.category,
      budget: gig.price,
      budgetType: "fixed",
      status: "in-progress",
      assignedFreelancer: gig.freelancer._id,
      skillsRequired: gig.skills,
      sourceGig: gig._id,
    });

    // Create notification for freelancer
    await Notification.create({
      recipient: gig.freelancer._id,
      sender: req.user._id,
      type: "acceptance",
      content: `${req.user.name} purchased your gig: ${gig.title}`,
      link: `/jobs/${project._id}`,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { getGigs, getGigById, createGig, getMyGigs, updateGig, deleteGig, purchaseGig };
