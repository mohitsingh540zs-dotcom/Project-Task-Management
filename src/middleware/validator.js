export const registerValidator = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  next();
};

export const loginValidator = (req, res, next) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    });
  }
  next();
};
