const express = require("express");
const path = require("node:path");
const passport = require("passport");
const session = require("./config/session.js");
const { accountRouter } = require("./routers/accountRouter.js");
const fetchFolders = require("./middleware/fetchFolders.js").fetchFolders;
const { fileRouter } = require("./routers/fileRouter.js");
const { authCheck } = require("./middleware/authCheck.js");

require("./config/passport.js");

const PORT = 3000;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));

app.use(session());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/account", accountRouter);
app.use("/files", authCheck, fileRouter);
app.get("/", fetchFolders, (req, res) => {
  res.render("index");
});

app.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`listening on PORT ${PORT}`);
});
