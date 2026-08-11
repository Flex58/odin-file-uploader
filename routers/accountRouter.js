const accountController = require("../controllers/accountController");

const { Router } = require("express");

const accountRouter = Router();

accountRouter.get("/sign-up", accountController.getSignUp);
accountRouter.post("/sign-up", accountController.postSignUp);
accountRouter.get("/sign-in", accountController.getSignIn);
accountRouter.post("/sign-in", accountController.postSignIn);
accountRouter.get("/sign-out", accountController.getSignOut);

module.exports = { accountRouter };
