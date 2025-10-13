const adminAuth = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not Authorized login again" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only: Not authorized" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ success: false, message: error.message });
  }
};

export default adminAuth;