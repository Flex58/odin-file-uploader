const fileController = require("../controllers/fileController");

const { Router } = require("express");

const fileRouter = Router();

fileRouter.get("/create-folder", fileController.getCreateFolder);
fileRouter.post("/create-folder", fileController.postCreateFolder);
fileRouter.get("/:folderId", fileController.getViewFolder);

module.exports = { fileRouter };
