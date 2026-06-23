const expressSession = require("express-session");
require("dotenv").config();
const { prisma } = require("../lib/prisma.js");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

module.exports = function () {
  return expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, //30days
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  });
};
