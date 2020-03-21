import multer from 'multer';
import { app } from './../config/app';
import { transErrors, transSuccess } from './../../lang/vi';
import uuidv4 from 'uuid/v4';
import { user } from './../services/index';
import fsExtra from 'fs-extra';
let storageAvatar = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, app.avatar_directory);
  },
  filename: (req, file, callback) => {
    let math = app.avatar_type;
    if (math.indexOf(file.mimetype) === -1) {
      return callback(transErrors.avatar_type, null); 
    }
    let avatarName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    callback(null, avatarName);
  }
});
let avatarUploadFile = multer({
  storage: storageAvatar,
  limits: { fileSize: app.avatar_limit_size }
}).single("avatar");

let updateAvatar = (req, res) => {
  avatarUploadFile(req, res, async (error) => {
    if (error) {
      if (error.message) {
        return res.status(500).send(transErrors.avatar_size);
      }
      return res.status(500).send(error);
    }
    try {
      let updateUserItem = {
        avatar: req.file.filename,
        updateAt: Date.now()
      };
      // update người dùng với dữ liệu updateUserItem theo id
      let userUpdate = await user.updateUser(req.user._id, updateUserItem);
      // xóa avatar cũ xài thư viện fs-etra
      await fsExtra.remove(`${app.avatar_directory}/${usserUpdate.avatar}`);

      let result = {
        message: transSuccess.avatar_updated,
        imageSrc: `/images/users/${req.file.filename}`
      };
      return res.status(200).send(result);
    } catch (error) {
      return console.log(error);
      return res.status(500).send(error);
    }
  });
}

module.exports = {
  updateAvatar: updateAvatar
}