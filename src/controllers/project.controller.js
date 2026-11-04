import {Project} from "../models/Project.js";

export const createProject = async (req, res, next) => {
  const { title, description, startDate, endDate, priority } = req.body;

  try {
    if (!title || !description || !startDate || !endDate || !priority) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be later than end date",
      });
    }

    const project = await Project.create({
      title,
      description,
      startDate,
      endDate,
      priority,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === "admin") {
      projects = await Project.find()
        .populate("manager", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });
    } else if (req.user.role === "projectManager") {
      projects = await Project.find({
        manager: req.user._id,
      })
        .populate("manager", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({
        members: req.user._id,
      })
        .populate("manager", "firstName lastName email")
        .populate("members", "firstName lastName email")
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      message: "All projects fetched",
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};
