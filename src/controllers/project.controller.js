import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";

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

export const assignProjectManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Id",
      });
    }

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: "Please provide manager",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const manager = await User.findById(managerId);

    if (!manager || manager.role !== "projectManager") {
      return res.status(404).json({
        success: false,
        message: "Valid project manager not found",
      });
    }

    project.manager = manager._id;
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project manager assigned successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const assignTeamMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { memberIds } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Id",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide member Ids",
      });
    }

    const members = await User.find({
      _id: { $in: memberIds },
      role: "team_member",
    });

    if (members.length !== new Set(memberIds).size) {
      return res.status(400).json({
        success: false,
        message: "One or more members are invalid",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isManager = project.manager?.toString() === req.user._id.toString();

    if (!isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: "You cannot assign members to this project",
      });
    }

    project.members = [
      ...new Set([
        ...project.members.map((member) => member.toString()),
        ...memberIds,
      ]),
    ];

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Team members assigned successfully",
      project,
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

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Id",
      });
    }

    const project = await Project.findById(id)
      .populate("manager", "firstName lastName email")
      .populate("members", "firstName lastName email")
      .populate("createdBy", "firstName lastName email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // admin can access all project
    if (req.user.role === "admin") {
      return res.status(200).json({
        success: true,
        message: "project fetched successfully",
        project,
      });
    }

    const isManager =
      project.manager?._id.toString() === req.user._id.toString();

    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString(),
    );

    if (!isManager && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this project",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isManager = project.manager?.toString() === req.user._id.toString();

    if (!isAdmin && !isManager) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project",
      });
    }

    const { title, description, startDate, endDate, status, priority } =
      req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const IsAdmin = req.user.role === "admin";

    const IsManager = project.manager?.toString() === req.user._id.toString();

    if (!IsAdmin && !IsManager) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized delete this project",
      });
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Project successfully deleted",
    });
    
  } catch (error) {
    next(error);
  }
};
