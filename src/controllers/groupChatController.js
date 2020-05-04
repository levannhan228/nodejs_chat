import { validationResult } from 'express-validator/check';
import { groupChat } from './../services/index'
let addNewGroup = async (req, res) => {
  let errorArr = [];
  let vadidationErrors = validationResult(req);

  if (!vadidationErrors.isEmpty()) {
    let errors = Object.values(validationResult(req).mapped());
    errors.forEach(item => {
      errorArr.push(item.msg)
    });
    return res.status(500).send(errorArr);
  }

  try {
    let currentUserId = req.user._id;
    let arrayMemberIds = req.body.arrayIds;
    let groupChatName = req.body.groupChatName;

    let newGroupChat = await groupChat.addNewGroup(currentUserId, arrayMemberIds, groupChatName);
    return res.status(200).send({groupChat: newGroupChat});
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports = {
  addNewGroup: addNewGroup
}