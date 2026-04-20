import Project from "../models/projectModel.js";
import Bid from "../models/bidModel.js";
import Notification from "../models/notificationModel.js";

const populateProject = (query) =>
  query
    .populate("client", "name email rating numReviews profile")
    .populate("assignedFreelancer", "name email rating numReviews profile");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { category, search, status, clientId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = "open";
    }

    if (category && category !== "All" && category !== "All Categories") {
      query.category = category;
    }

    if (clientId) {
      query.client = clientId;
    }

    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { skillsRequired: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const projects = await populateProject(Project.find(query).sort({ createdAt: -1 }));
    res.json(projects);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await populateProject(Project.findById(req.params.id));
    if (project) {
      res.json(project);
    } else {
      res.status(404);
      throw new Error("Project not found");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Get current user's projects
// @route   GET /api/projects/my
// @access  Private
const getMyProjects = async (req, res) => {
  try {
    const query = {
      $or: [{ client: req.user._id }, { assignedFreelancer: req.user._id }],
    };
    const projects = await populateProject(Project.find(query).sort({ createdAt: -1 }));
    res.json(projects);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Clients only)
const createProject = async (req, res) => {
  const {
    title,
    description,
    category,
    budget,
    budgetType,
    budgetMin,
    budgetMax,
    experienceLevel,
    duration,
    deadline,
    skillsRequired,
  } = req.body;

  try {
    if (req.user.role !== "client") {
      res.status(403);
      throw new Error("Only clients can create projects");
    }

    if (!title?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error("Title and description are required");
    }

    const normalizedBudget =
      budgetType === "hourly"
        ? Number(budgetMax || budgetMin || budget)
        : Number(budget || budgetMax || budgetMin);

    if (!normalizedBudget || normalizedBudget < 1) {
      res.status(400);
      throw new Error("A valid budget is required");
    }

    const project = await Project.create({
      client: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category || "Web Development",
      budget: normalizedBudget,
      budgetType: budgetType || "fixed",
      budgetMin,
      budgetMax,
      experienceLevel: experienceLevel || "Intermediate",
      duration: duration || "1 to 3 months",
      deadline,
      skillsRequired: Array.isArray(skillsRequired)
        ? skillsRequired.map((skill) => skill.trim()).filter(Boolean)
        : [],
    });

    const populatedProject = await populateProject(Project.findById(project._id));
    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private
const updateProjectStatus = async (req, res) => {
  const { status, deliveryMessage, deliveryLinks, revisionMessage } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    const isClient = project.client.toString() === req.user._id.toString();
    const isFreelancer = project.assignedFreelancer?.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer) {
      res.status(403);
      throw new Error("Not authorized to update this project status");
    }

    const validStatuses = ["open", "in-progress", "delivered", "completed", "cancelled", "revision"];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid project status");
    }

    // Role-based status transitions
    if (isFreelancer) {
      if (status !== "delivered") {
        res.status(403);
        throw new Error("Freelancers can only move projects to 'delivered' status");
      }
      if (project.status !== "in-progress" && project.status !== "revision") {
        res.status(400);
        throw new Error("Can only deliver projects that are in-progress or in revision");
      }
    }

    if (isClient) {
      if (status === "delivered" && !isFreelancer) {
        res.status(403);
        throw new Error("Only the assigned freelancer can deliver work");
      }
      if (status === "completed" && project.status !== "delivered") {
        res.status(400);
        throw new Error("Can only complete projects that have been delivered");
      }
      if (status === "revision" && project.status !== "delivered") {
        res.status(400);
        throw new Error("Can only request revision on delivered projects");
      }
      if (status === "cancelled" && !["open", "in-progress"].includes(project.status)) {
        res.status(400);
        throw new Error("Can only cancel open or in-progress projects");
      }
    }

    if (status === "open") {
      project.assignedFreelancer = undefined;
      await Bid.updateMany({ project: project._id }, { status: "pending" });
    }

    if (["completed", "in-progress", "delivered"].includes(status) && !project.assignedFreelancer) {
      res.status(400);
      throw new Error("Assign a freelancer before moving the project forward");
    }

    // Save delivery content
    if (status === "delivered") {
      project.deliveryMessage = deliveryMessage || "";
      project.deliveryLinks = Array.isArray(deliveryLinks) ? deliveryLinks.filter(Boolean) : [];
      project.deliveredAt = new Date();
    }

    // Save revision message
    if (status === "revision") {
      project.revisionMessage = revisionMessage || "";
    }

    project.status = status;
    await project.save();

    // Create notifications for status updates
    if (status === "delivered") {
      await Notification.create({
        recipient: project.client,
        sender: req.user._id,
        type: "delivery",
        content: `Work for "${project.title}" has been delivered by ${req.user.name}.`,
        link: `/jobs/${project._id}`,
      });
    } else if (status === "completed") {
      await Notification.create({
        recipient: project.assignedFreelancer,
        sender: req.user._id,
        type: "completion",
        content: `Project "${project.title}" has been approved and completed by the client.`,
        link: `/jobs/${project._id}`,
      });
    } else if (status === "revision") {
      await Notification.create({
        recipient: project.assignedFreelancer,
        sender: req.user._id,
        type: "delivery",
        content: `Client requested a revision on "${project.title}": ${revisionMessage || "No details provided."}`,
        link: `/jobs/${project._id}`,
      });
    } else if (status === "cancelled") {
      const recipientId = isClient ? project.assignedFreelancer : project.client;
      if (recipientId) {
        await Notification.create({
          recipient: recipientId,
          sender: req.user._id,
          type: "completion",
          content: `Project "${project.title}" has been cancelled.`,
          link: `/jobs/${project._id}`,
        });
      }
    }

    const updatedProject = await populateProject(Project.findById(project._id));
    res.json(updatedProject);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private (Project owner only)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    if (project.client.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the project owner can edit this project");
    }

    if (project.status !== "open") {
      res.status(400);
      throw new Error("Can only edit projects that are still open");
    }

    const { title, description, category, budget, budgetType, budgetMin, budgetMax, experienceLevel, duration, deadline, skillsRequired } = req.body;

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (category) project.category = category;
    if (budget) project.budget = Number(budget);
    if (budgetType) project.budgetType = budgetType;
    if (budgetMin !== undefined) project.budgetMin = budgetMin;
    if (budgetMax !== undefined) project.budgetMax = budgetMax;
    if (experienceLevel) project.experienceLevel = experienceLevel;
    if (duration) project.duration = duration;
    if (deadline !== undefined) project.deadline = deadline;
    if (Array.isArray(skillsRequired)) {
      project.skillsRequired = skillsRequired.map(s => s.trim()).filter(Boolean);
    }

    await project.save();
    const updatedProject = await populateProject(Project.findById(project._id));
    res.json(updatedProject);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export {
  getProjects,
  getProjectById,
  getMyProjects,
  createProject,
  updateProjectStatus,
  updateProject,
};

