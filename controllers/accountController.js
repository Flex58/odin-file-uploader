const { body, validationResult, matchedData } = require("express-validator");
const db = require("../lib/queries");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("dotenv").config();

const formValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid Email address")
    .custom(async (value) => {
      const data = await db.getUserByEmail(value);
      if (data) {
        throw new Error("Email is already in use");
      }
    })
    .withMessage("Email is already in use"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isStrongPassword({
      minLength: 8,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      "Password must be at least 8 characters long, have 1 uppercase nad include at least 1 number",
    ),
  body("confirm")
    .notEmpty()
    .withMessage("Password doesn't match")
    .custom(async (confirm, { req }) => {
      if (confirm !== req.body.password) {
        throw new Error("Password doesn't match");
      }
    })
    .withMessage("Password doesn't match"),
];

exports.getSignUp = (req, res) => {
  res.render("sign-up");
};

exports.postSignUp = [
  formValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", {
        errors: errors.array(),
        name: req.body.name,
        email: req.body.email,
      });
    }
    const data = matchedData(req);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    try {
      await db.createUser(data.email, data.name, hashedPassword);
      res.redirect("/");
    } catch (err) {
      return next(err);
    }
  },
];

exports.getSignIn = (req, res) => {
  res.render("sign-in", { message: req.session.message });
};

exports.postSignIn = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/account/sign-in",
  failureMessage: true,
});
