const CustomForbiddenError = require("../errors/CustomForbiddenError");
const db = require("../lib/queries.js");

exports.authOwner = async (req, res, next) => {
  const folderId = parseInt(req.params.folderId);
  try {
    const data = await db.getFolderByAuthAndId(folderId, req.user.id);
    if (!data) {
      throw new CustomForbiddenError(
        "You do not have permssion to view this site",
      );
    }
  } catch (err) {
    next(err);
  }
  next();
};
