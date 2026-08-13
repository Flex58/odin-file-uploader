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

exports.createFolder = async (authorId, name, folderParent = null) => {
  const data = await prisma.folder.create({
    data: {
      name: name,
      folderId: folderParent,
      authorId: authorId,
    },
    include: {
      folder: true,
      files: true,
    },
  });
  return data;
};

exports.getFoldersByAuthor = async (authorId) => {
  const data = await prisma.folder.findMany({
    where: {
      authorId: authorId,
      folderId: null,
    },
    include: {
      folders: true,
      files: true,
    },
  });
  return data;
};

exports.getFolderByName = async (authorId, folderName) => {
  const data = await prisma.folder.findFirst({
    where: {
      authorId: authorId,
      name: folderName,
    },
    include: {
      folders: true,
      files: true,
    },
  });
  return data;
};

exports.getFolderById = async (id) => {
  const data = await prisma.folder.findUnique({
    where: {
      id: id,
    },
    include: {
      folders: true,
      files: true,
    },
  });
  return data;
};

exports.deleteFolder = async (id) => {
  //TODO CASCADED FILES REMOVE FILE FROM DISK
  await prisma.folder.delete({
    where: {
      id: id,
    },
  });
};

exports.updateFolderName = async (id, name) => {
  await prisma.folder.update({
    where: {
      id: id,
    },
    data: {
      name: name,
    },
  });
};

exports.uploadFile = async (name, size, path, authorId, folderId) => {
  const data = await prisma.files.create({
    data: {
      name: name,
      size: size,
      uploadTime: new Date(),
      path: path,
      authorId: authorId,
      folderId: folderId,
    },
  });
  return data;
};
