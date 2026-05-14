import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (!["client", "freelancer"].includes(role)) {
    res.status(400);
    throw new Error("Role must be either client or freelancer");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rating: user.rating,
      numReviews: user.numReviews,
      profile: user.profile,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const {
    name,
    role,
    title,
    tagline,
    bio,
    location,
    hourlyRate,
    skills,
    portfolio,
    avatar,
  } = req.body;

  user.name = name?.trim() || user.name;

  if (role && ["client", "freelancer"].includes(role)) {
    user.role = role;
  }

  user.profile = {
    ...user.profile,
    title: typeof title === "string" ? title.trim() : user.profile?.title || "",
    tagline:
      typeof tagline === "string" ? tagline.trim() : user.profile?.tagline || "",
    bio: typeof bio === "string" ? bio.trim() : user.profile?.bio || "",
    location:
      typeof location === "string"
        ? location.trim()
        : user.profile?.location || "",
    hourlyRate:
      typeof hourlyRate === "number"
        ? hourlyRate
        : user.profile?.hourlyRate || 0,
    skills: Array.isArray(skills)
      ? skills.map((skill) => skill.trim()).filter(Boolean)
      : user.profile?.skills || [],
    portfolio: Array.isArray(portfolio)
      ? portfolio.map((item) => item.trim()).filter(Boolean)
      : user.profile?.portfolio || [],
    avatar:
      typeof avatar === "string" ? avatar.trim() : user.profile?.avatar || "",
  };

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    rating: updatedUser.rating,
    numReviews: updatedUser.numReviews,
    profile: updatedUser.profile,
  });
};

// @desc    Get all users (search)
// @route   GET /api/users?search=rahul
// @access  Private
const allUsers = async (req, res) => {
  if (!req.query.search?.trim()) {
    return res.json([]);
  }

  const keyword = {
    $or: [
      { name: { $regex: req.query.search.trim(), $options: "i" } },
    ],
  };

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select("name role profile rating numReviews")
    .limit(20);

  res.send(users);
};

// @desc    Get public profile by user ID
// @route   GET /api/users/:id
// @access  Public
const getPublicProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  allUsers,
  getPublicProfile,
};
