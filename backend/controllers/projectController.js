import Project from "../models/projectModel.js";

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "open" }).sort({
      createdAt: -1,
    });
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
    const project = await Project.findById(req.params.id).populate(
      "client",
      "name email"
    );
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
    skillsRequired 
  } = req.body;

  try {
    const project = await Project.create({
      client: req.user._id,
      title,
      description,
      category: category || "Web Development",
      budget: budget || budgetMax || budgetMin,
      budgetType: budgetType || "fixed",
      budgetMin,
      budgetMax,
      experienceLevel: experienceLevel || "Intermediate",
      duration: duration || "1 to 3 months",
      deadline,
      skillsRequired: skillsRequired || [],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { getProjects, getProjectById, createProject };
