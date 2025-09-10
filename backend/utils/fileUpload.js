const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('./appError');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const kycDir = path.join(uploadsDir, 'kyc');
if (!fs.existsSync(kycDir)) {
  fs.mkdirSync(kycDir, { recursive: true });
}

const profilePicsDir = path.join(uploadsDir, 'profile-pictures');
if (!fs.existsSync(profilePicsDir)) {
  fs.mkdirSync(profilePicsDir, { recursive: true });
}
 
const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    if (file.fieldname === 'kycDocument') {
      cb(null, kycDir);
    } else if (file.fieldname === 'profilePicture') {
      cb(null, profilePicsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) { 
    const userId = req.user ? req.user.id : 'unknown';
    const uniqueSuffix = `${userId}-${Date.now()}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});
 
const fileFilter = (req, file, cb) => { 
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
 
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});
 
exports.uploadKycDocument = upload.single('kycDocument');
 
exports.uploadProfilePicture = upload.single('profilePicture');
 
exports.uploadFile = (fieldName) => upload.single(fieldName);
 
exports.uploadFiles = (fieldName, maxCount) => upload.array(fieldName, maxCount);
 
exports.handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large! Max size is 5MB.', 400));
    }
    return next(new AppError(`Upload error: ${err.message}`, 400));
  }
  
  if (err) {
    return next(err);
  }
  
  next();
};
