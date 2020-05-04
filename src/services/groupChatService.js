import _ from 'lodash';
import ChatGroupModel from './../models/chatGroupModel'

let addNewGroup = (currentUserId, arrayMemberIds, groupChatName) => {
  return new Promise(async (resolve, reject) => {
    try {
      // thêm người dùng hiện tại vào thành viên nhóm
      arrayMemberIds.unshift({ userId: `${currentUserId}` }); // unshift đây 1 phần tử vào vị trí đầu tiên của mảng
      // lọc id bị trùng nếu thêm nhiều lần 1 người
      arrayMemberIds = _.uniqBy(arrayMemberIds, "userId");
      let newGroupItem = {
        name: groupChatName,
        userAmount: arrayMemberIds.length,
        userId: `${currentUserId}`,
        members: arrayMemberIds
      };

      let newGroup = await ChatGroupModel.createNew(newGroupItem);
      resolve(newGroup);
    } catch (error) {
      reject(error);
    }
  })
};

module.exports = {
  addNewGroup: addNewGroup
}