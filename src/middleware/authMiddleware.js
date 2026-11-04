import { User } from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;

  try {
    if (!token) {
      return res.status(401).json({
        success: false,
        message: " Unauthorized, No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, User not found",
      });
    }

    req.user = user;
    next();
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, Invalid token",
    });
  }
};
