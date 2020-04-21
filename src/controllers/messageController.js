import { validationResult } from "express-validator/check";
import {message} from './../services/index';
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
    
    return res.status(200).send({message: newMesage});
    //21:25
  } catch (error) {
    return res.status(500).send(error);
  }
}

module.exports = {
  addnewTextEmoji : addnewTextEmoji
}