const db = require("../lib/queries");

exports.fetchFolders = async (req, res, next) => {
  if (req.user) {
    const folders = await db.getFoldersByAuthor(req.user.id);
    res.locals.folders = folders;
    next();
  }
  res.locals.folders = undefined;
  next();
};
