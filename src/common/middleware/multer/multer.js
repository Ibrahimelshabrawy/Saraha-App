import fs from "fs";
import path from "path";
import multer from "multer";

export const multer_local = ({custom_types = []} = {}) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let folderPath;

      if (file.fieldname === "attachment") {
        folderPath = path.join(process.cwd(), "uploads", "profilePics");
      } else if (file.fieldname === "attachments") {
        folderPath = path.join(process.cwd(), "uploads", "coverPics");
      } else if (file.fieldname === "messagePhotos") {
        folderPath = path.join(process.cwd(), "uploads", "messages");
      } else {
        folderPath = path.join(process.cwd(), "uploads", "gallery");
      }

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, {recursive: true});
      }

      cb(null, folderPath);
    },

    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname.replaceAll(" ", "-"));
    },
  });

  function fileFilter(req, file, cb) {
    if (!custom_types.includes(file.mimetype)) {
      return cb(new Error("Invalid File Type", {cause: 400}));
    }
    return cb(null, true);
  }

  return multer({storage, fileFilter});
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
