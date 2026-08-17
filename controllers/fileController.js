const multer = require("multer");
const db = require("../lib/queries");
const { body, validationResult, matchedData } = require("express-validator");
const path = require("path");
const { unlink } = require("fs");
const CustomNotFoundError = require("../errors/CustomNotFoundErrror");

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error("Invalid Filetype"));
  }
  return cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
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
  res.render("create-folder", { param: req.params.folderId });
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
    const folderParentID = parseInt(req.params.folderId) || null;
    const authorId = req.user.id;
    try {
      const newFolderId = await db.createFolder(
        authorId,
        data.folder,
        folderParentID,
      );
      res.redirect("/files/" + newFolderId.id);
    } catch (err) {
      return next(err);
    }
  },
];

exports.getViewFolder = async (req, res, next) => {
  try {
    const folder = await db.getFolderById(parseInt(req.params.folderId));
    if (!folder) throw new CustomNotFoundError("Folder not found");
    res.render("view-folder", { folder: folder });
  } catch (err) {
    next(err);
  }
};

exports.getEditFolder = async (req, res, next) => {
  try {
    const param = req.params.folderId;
    const folder = await db.getFolderById(parseInt(param));
    if (!folder) throw new CustomNotFoundError("Folder not found");
    res.render("edit-folder", { param: param, name: folder.name });
  } catch (err) {
    next(err);
  }
};

exports.postEditFolder = [
  folderValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    const folderId = req.params.folderId;
    if (!errors.isEmpty()) {
      return res.status(400).render("edit-folder", {
        errors: errors.array(),
        param: folderId,
        name: req.body.name,
      });
    }
    const data = matchedData(req);
    try {
      await db.updateFolderName(parseInt(folderId), data.folder);
      res.redirect("/files/" + folderId);
    } catch (err) {
      next(err);
    }
  },
];

exports.getDeleteFolder = (req, res) => {
  res.render("delete-folder", { folderId: req.params.folderId });
};

exports.postDeleteFolder = async (req, res, next) => {
  const folderId = parseInt(req.params.folderId);
  try {
    const folder = await db.getFolderById(folderId);
    if (!folder) throw new CustomNotFoundError("Folder not found");
    if (folder.files) {
      for await (const file of folder.files) {
        await unlinkFile(file.id);
      }
    }
    await db.deleteFolder(folderId);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.getUploadFile = (req, res) => {
  res.render("upload-file", { folderId: req.params.folderId });
};

exports.postUploadFile = [
  upload.single("image"),
  async (req, res, next) => {
    try {
      const folderId = req.params.folderId;
      const authorId = req.user.id;
      const file = await db.uploadFile(
        req.file.filename,
        req.file.size,
        req.file.path,
        authorId,
        parseInt(folderId),
      );
      res.redirect(`/files/${folderId}/${file.id}`);
    } catch (err) {
      return next(err);
    }
  },
];

exports.getFile = async (req, res, next) => {
  const fileId = parseInt(req.params.fileId);
  try {
    const file = await db.getFileById(fileId);
    if (!file) throw new CustomNotFoundError("File not found");
    file.size = Number(file.size / 1024 / 1024, 2).toFixed(2) + "MB";
    file.uploadTime = new Date(file.uploadTime).toLocaleString("en-GB");
    res.render("view-file", { file: file });
  } catch (err) {
    next(err);
  }
};

exports.getFileRaw = async (req, res, next) => {
  const fileId = parseInt(req.params.fileId);
  try {
    const file = await db.getFileById(fileId);
    if (!file) throw new CustomNotFoundError("File not found");
    res.sendFile(file.path);
  } catch (err) {
    next(err);
  }
};

exports.getFileDownload = async (req, res, next) => {
  const fileId = parseInt(req.params.fileId);
  try {
    const file = await db.getFileById(fileId);
    if (!file) throw new CustomNotFoundError("File not found");
    res.download(file.path);
  } catch (err) {
    next(err);
  }
};

exports.getDeleteFile = async (req, res) => {
  res.render("delete-file", {
    folderId: req.params.folderId,
    fileId: req.params.fileId,
  });
};

exports.postDeleteFile = async (req, res, next) => {
  const fileId = parseInt(req.params.fileId);
  try {
    await unlinkFile(fileId);
    await db.deleteFileById(fileId);
    res.redirect(`/files/${req.params.folderId}`);
  } catch (err) {
    next(err);
  }
};

const unlinkFile = async (id) => {
  const file = await db.getFileById(id);
  if (!file) throw new CustomNotFoundError("File not found");
  unlink(file.path, (err) => {
    if (err) throw err;
  });
};
