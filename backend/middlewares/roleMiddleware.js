const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`[authorize] ${req.method} ${req.originalUrl}`);
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { authorize };
