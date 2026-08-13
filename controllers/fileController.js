const multer = require("multer");
const db = require("../lib/queries");
const { body, validationResult, matchedData } = require("express-validator");
const path = require("path");

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error("Invalid Filetype"));
  }
  return cb(null, true);
};

const upload = multer({
  dest: path.join(__dirname, "..", "uploads/"),
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, //20MB
    files: 1,
  },
});

const folderValidation = [
  body("folder")
    .trim()
    .notEmpty()
    .withMessage("The folder requires a name")
    .isLength({ max: 255 })
    .withMessage("Folder name length can't exceed 255 characters")
    .custom(async (value, { req }) => {
      const data = await db.getFolderByName(req.user.id, value);
      if (data) {
        throw new Error("One of your Folders already uses this Name");
      }
    }) //check if foldername is unique per user
    .withMessage("One of your Folders already uses this Name"),
];

exports.getCreateFolder = (req, res) => {
  res.render("create-folder");
};

exports.postCreateFolder = [
  folderValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .render("create-folder", { errors: errors.array() });
    }
    const data = matchedData(req);
    const folderParentID = req.params.folderId || null;
    const authorId = req.user.id;
    try {
      const newFolderId = await db.createFolder(
        authorId,
        data.folder,
        folderParentID,
      );
      res.render("/files/" + newFolderId.id);
    } catch (err) {
      return next(err);
    }
  },
];

exports.getViewFolder = async (req, res, next) => {
  try {
    const folder = await db.getFolderById(parseInt(req.params.folderId));
    res.render("view-folder", { folder: folder });
  } catch (err) {
    next(err);
  }
};

exports.getUploadFile = (req, res) => {
  //need folderId from params
  res.render("upload-file");
};

((exports.postUploadFile = upload.single("image")),
  async (req, res, next) => {
    try {
      //need folderID and userID
      await db.uploadFile(req.file);
      res.redirect("/");
    } catch (error) {
      return next(err);
    }
  });
