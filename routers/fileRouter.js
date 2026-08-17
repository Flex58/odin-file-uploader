const fileController = require("../controllers/fileController");

const { Router } = require("express");

const fileRouter = Router();

fileRouter.get("/create-folder", fileController.getCreateFolder);
fileRouter.post("/create-folder", fileController.postCreateFolder);
fileRouter.get("/:folderId/create-folder", fileController.getCreateFolder);
fileRouter.post("/:folderId/create-folder", fileController.postCreateFolder);
fileRouter.get("/:folderId", fileController.getViewFolder);
fileRouter.get("/:folderId/edit", fileController.getEditFolder);
fileRouter.post("/:folderId/edit", fileController.postEditFolder);
fileRouter.get("/:folderId/upload", fileController.getUploadFile);
fileRouter.post("/:folderId/upload", fileController.postUploadFile);
fileRouter.get("/:folderId/:fileId/raw", fileController.getFileRaw);
fileRouter.get("/:folderId/:fileId/download", fileController.getFileDownload);
fileRouter.get("/:folderId/:fileId", fileController.getFile);

module.exports = { fileRouter };
