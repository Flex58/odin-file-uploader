const { prisma } = require("./prisma.js");

exports.getUserByEmail = async (email) => {
  const data = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return data;
};

exports.getUserById = async (id) => {
  const data = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return data;
};

exports.createUser = async (email, name, password) => {
  await prisma.user.create({
    data: {
      email: email,
      name: name,
      password: password,
    },
    include: {
      folders: true,
      files: true,
    },
  });
};
