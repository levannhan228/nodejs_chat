import { validationResult } from "express-validator/check";
import { message } from './../services/index';
import multer from 'multer';
import { app } from './../config/app';
import { transErrors, transSuccess } from './../../lang/vi';
import fsExtra from "fs-extra";
import ejs from "ejs";
import { lastItemOfArray, convertTimestampToHumanTime, bufferToBase64 } from "./../helpers/clientHelper";
// biến hàm renderFile của ejs trở thành function có thể sử dung asyc await
import { promisify } from "util";
const renderFile = promisify(ejs.renderFile).bind(ejs);

// xử lý text và icon
let addnewTextEmoji = async (req, res) => {
  let errorArr = [];
  let vadidationErrors = validationResult(req)

  if (!vadidationErrors.isEmpty()) {
    let errors = Object.values(validationResult(req).mapped());
    errors.forEach(item => {
      errorArr.push(item.msg)
    });

    return res.status(500).send(errorArr);
  }

  try {
    let sender = {
      id: req.user._id,
      name: req.user.username,
      avatar: req.user.avatar,
    };
    let receivedId = req.body.uid;
    let messageVal = req.body.messageVal;
    let isChatGroup = req.body.isChatGroup;

    let newMesage = await message.addnewTextEmoji(sender, receivedId, messageVal, isChatGroup);

    return res.status(200).send({ message: newMesage });
    //21:25
  } catch (error) {
    return res.status(500).send(error);
  }
};

// xử lý hình ảnh
let storageImageChat = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, app.image_message_directory);
  },
  filename: (req, file, callback) => {
    let math = app.image_message_type;
    if (math.indexOf(file.mimetype) === -1) {
      return callback(transErrors.image_message_type, null);
    }
    let imageName = `${file.originalname}`;
    callback(null, imageName);
  }
});

let imageMessageUploadFile = multer({
  storage: storageImageChat,
  limits: { fileSize: app.image_message_limit_size }
}).single("my-image-chat");

let addNewImage = async (req, res) => {
  imageMessageUploadFile(req, res, async (error) => {
    if (error) {
      if (error.message) {
        return res.status(500).send(transErrors.image_message_size);
      }
      return res.status(500).send(error);
    }
    try {
      let sender = {
        id: req.user._id,
        name: req.user.username,
        avatar: req.user.avatar,
      };
      let receivedId = req.body.uid;
      let messageVal = req.file;
      let isChatGroup = req.body.isChatGroup;

      let newMessage = await message.addNewImage(sender, receivedId, messageVal, isChatGroup);
      // xóa ảnh để lưu vào mongodb
      await fsExtra.remove(`${app.image_message_directory}/${newMessage.file.fileName}`)
      return res.status(200).send({ message: newMessage });
      //21:25
    } catch (error) {
      return res.status(500).send(error);
    }
  });
};

// xử lý tệp
let storageAttachmentChat = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, app.attachment_message_directory);
  },
  filename: (req, file, callback) => {
    let attachmentName = `${file.originalname}`;
    callback(null, attachmentName);
  }
});

let attachmentMessageUploadFile = multer({
  storage: storageAttachmentChat,
  limits: { fileSize: app.attachment_message_limit_size }
}).single("my-attachment-chat");

let addNewAttachment = async (req, res) => {
  attachmentMessageUploadFile(req, res, async (error) => {
    if (error) {
      if (error.message) {
        return res.status(500).send(transErrors.attachment_message_size);
      }
      return res.status(500).send(error);
    }
    try {
      let sender = {
        id: req.user._id,
        name: req.user.username,
        avatar: req.user.avatar,
      };
      let receivedId = req.body.uid;
      let messageVal = req.file;
      let isChatGroup = req.body.isChatGroup;

      let newMessage = await message.addNewAttachment(sender, receivedId, messageVal, isChatGroup);
      // xóa tệp trong project  và lưu vào mongodb
      await fsExtra.remove(`${app.attachment_message_directory}/${newMessage.file.fileName}`)
      return res.status(200).send({ message: newMessage });
      //21:25
    } catch (error) {
      return res.status(500).send(error);
    }
  });
};

let readMoreAllChat = async (req, res) => {
  try {
    let skipPersonal = +(req.query.skipPersonal);
    let skipGroup = +(req.query.skipGroup);

    let newAllConversations = await message.readMoreAllChat(req.user._id, skipPersonal, skipGroup);

    let dataToRender = {
      newAllConversations: newAllConversations,
      lastItemOfArray: lastItemOfArray,
      convertTimestampToHumanTime: convertTimestampToHumanTime,
      bufferToBase64: bufferToBase64,
      user: req.user
    };

    let leftSideData = await renderFile("src/views/main/readMoreConversations/_leftSide.ejs", dataToRender);
    let rightSideData = await renderFile("src/views/main/readMoreConversations/_rightSide.ejs", dataToRender);
    let imageModalData = await renderFile("src/views/main/readMoreConversations/_imageModal.ejs", dataToRender);
    let attachmentModalData = await renderFile("src/views/main/readMoreConversations/_attachmentModal.ejs", dataToRender);

    return res.status(200).send({
      leftSideData: leftSideData,
      rightSideData: rightSideData,
      imageModalData: imageModalData,
      attachmentModalData: attachmentModalData,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
}

let readMore = async (req, res) => {
  try {
    let skipMessage = +(req.query.skipMessage); // dấu + là conver sang kiểu number
    let targetId = req.query.targetId; 
    let chatInGroup = (req.query.chatInGroup === "true"); // mẹo chuyển string -> boolean

    let newMesages = await message.readMore(req.user._id, skipMessage, targetId, chatInGroup);

    let dataToRender = {
      newMesages: newMesages,
      bufferToBase64: bufferToBase64,
      user: req.user
    };

    let rightSideData = await renderFile("src/views/main/readMoreMessages/_rightSide.ejs", dataToRender);
    let imageModalData = await renderFile("src/views/main/readMoreMessages/_imageModal.ejs", dataToRender);
    let attachmentModalData = await renderFile("src/views/main/readMoreMessages/_attachmentModal.ejs", dataToRender);

    return res.status(200).send({
      rightSideData: rightSideData,
      imageModalData: imageModalData,
      attachmentModalData: attachmentModalData,
    });
  } catch (error) {
    return res.status(500).send(error);
  }
}
module.exports = {
  addnewTextEmoji: addnewTextEmoji,
  addNewImage: addNewImage,
  addNewAttachment: addNewAttachment,
  readMoreAllChat: readMoreAllChat,
  readMore : readMore
};