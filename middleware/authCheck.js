const CustomForbiddenError = require("../errors/CustomForbiddenError");

exports.authCheck = async (req, res, next) => {
  if (!req.user) {
    throw new CustomForbiddenError(
      "Sign-in or Create an Account to view this site",
    );
  }
  next();
};
