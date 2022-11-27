const multer = require("multer");
const path = require("path");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png"
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const filePath = path.join(__dirname, '../images/');
    cb(null, filePath);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    cb(null, Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
