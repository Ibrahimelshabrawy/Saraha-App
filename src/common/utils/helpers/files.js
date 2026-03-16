import path from "node:path";
import fs from "node:fs";
export const deleteFile = (filePath) => {
  try {
    if (!filePath) return;

    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.log("Delete File Error", error.message);
  }
};

export const deleteFiles = (files = []) => {
  if (!Array.isArray(files)) return;
  for (const file of files) {
    deleteFile(file);
  }
};

export const moveFile = ({oldPath}) => {
  const previousPath = path.join(process.cwd(), oldPath);
  if (!fs.existsSync(previousPath)) {
    throw new Error("Old file does not exist", {cause: 404});
  }

  const newFolder = path.join(process.cwd(), "uploads", "gallery");
  if (!fs.existsSync(newFolder)) {
    fs.mkdirSync(newFolder, {recursive: true});
  }

  const fileName = path.basename(oldPath);
  const newPath = path.join(newFolder, fileName);

  fs.renameSync(previousPath, newPath);
  return path.join("uploads", "gallery", fileName).replace(/\\/g, "/");
};
