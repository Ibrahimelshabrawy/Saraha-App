import multer from "multer";
import fs from "node:fs";

export const multer_local = ({
  custom_path = "General",
  custom_types = [],
} = {}) => {
  const fullPath = `uploads/${custom_path}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, {recursive: true});
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
  function fileFilter(req, file, cb) {
    if (!custom_types.includes(file.mimetype)) {
      return cb(new Error("inValid File Type", {cause: 400}));
    }
    return cb(null, true);
  }

  const upload = multer({storage, fileFilter});
  return upload;
};

export const multer_host = (custom_types = []) => {
  const storage = multer.diskStorage({
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
  function fileFilter(req, file, cb) {
    if (!custom_types.includes(file.mimetype)) {
      return cb(new Error("inValid File Type", {cause: 400}));
    }
    return cb(null, true);
  }

  const upload = multer({storage, fileFilter});
  return upload;
};
