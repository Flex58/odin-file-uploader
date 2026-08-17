const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const queries = require("../lib/queries.js");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await queries.getUserByEmail(email);

        if (!user) {
          return done(null, false, { message: "Incorrect Email or Password" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return done(null, false, {
            message: "Incorrect Email or Password",
            email: email,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await queries.getUserById(id);

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
