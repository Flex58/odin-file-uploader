const fileController = require("../controllers/fileController");
const { authOwner } = require("../middleware/authOwner");

const { Router } = require("express");

const fileRouter = Router();

fileRouter.get("/create-folder", fileController.getCreateFolder);
fileRouter.post("/create-folder", fileController.postCreateFolder);
fileRouter.get(
  "/:folderId/create-folder",
  authOwner,
  fileController.getCreateFolder,
);
fileRouter.post(
  "/:folderId/create-folder",
  authOwner,
  fileController.postCreateFolder,
);
fileRouter.get("/:folderId", authOwner, fileController.getViewFolder);
fileRouter.get("/:folderId/edit", authOwner, fileController.getEditFolder);
fileRouter.post("/:folderId/edit", authOwner, fileController.postEditFolder);
fileRouter.get("/:folderId/delete", authOwner, fileController.getDeleteFolder);
fileRouter.post(
  "/:folderId/delete",
  authOwner,
  fileController.postDeleteFolder,
);
fileRouter.get("/:folderId/upload", authOwner, fileController.getUploadFile);
fileRouter.post("/:folderId/upload", authOwner, fileController.postUploadFile);
fileRouter.get("/:folderId/:fileId/raw", authOwner, fileController.getFileRaw);
fileRouter.get(
  "/:folderId/:fileId/download",
  authOwner,
  fileController.getFileDownload,
);
fileRouter.get(
  "/:folderId/:fileId/delete",
  authOwner,
  fileController.getDeleteFile,
);
fileRouter.post(
  "/:folderId/:fileId/delete",
  authOwner,
  fileController.postDeleteFile,
);
fileRouter.get("/:folderId/:fileId", authOwner, fileController.getFile);

module.exports = { fileRouter };
