const expressSession = require("express-session");
require("dotenv").config();
const pool = require("../lib/prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

module.exports = function () {
  return expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, //30days
    store: new PrismaSessionStore(pool, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  });
};
