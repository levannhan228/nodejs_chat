import ContactModel from './../models/contactModel';
import UserModel from './../models/userModel';
import ChatGroupModel from './../models/chatGroupModel';
import MessageModel from './../models/MessageModel';
import _ from 'lodash';

const LIMIT_CONVERSATIONS_TAKEN = 10;
const LIMIT_MESSAGES_TAKEN = 20;

let getAllConversationItems = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let contacts = await ContactModel.getContacts(currentUserId, LIMIT_CONVERSATIONS_TAKEN);
      let userConversationsPromise = contacts.map(async (contact) => {
        if (contact.contactId == currentUserId) {
          let getUserContact = await UserModel.getNormalUserDataById(contact.userId);
          getUserContact.updatedAt = contact.updatedAt;
          return getUserContact;
        } else {
          let getUserContact = await UserModel.getNormalUserDataById(contact.contactId);
          getUserContact.updatedAt = contact.updatedAt;
          return getUserContact;
        }
      });
      let userConversations = await Promise.all(userConversationsPromise);
      let groupConversations = await ChatGroupModel.getChatGroups(currentUserId, LIMIT_CONVERSATIONS_TAKEN);
      let allConversations = userConversations.concat(groupConversations);

      allConversations = _.sortBy(allConversations, (item) => {
        return -item.updatedAt;
      });

      // lấy tin nhắn đẩy vào màn hình
      let allConversationsWithMessagePromise = allConversations.map(async (converations) => {
        converations = converations.toObject();
        if(converations.members){
          let getMessages = await MessageModel.model.getMessagesInGroup(converations._id, LIMIT_MESSAGES_TAKEN);
          converations.messages = getMessages;
        }else{
          let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, converations._id, LIMIT_MESSAGES_TAKEN);
          converations.messages = getMessages;
        }
        return converations;
      });

      let allConversationsWithMessage = await Promise.all(allConversationsWithMessagePromise);
      // sắp xếp lại lần nữa cho chắc kèo
      allConversationsWithMessage = _.sortBy(allConversationsWithMessage, (item) => {
        return -item.updatedAt;
      });
      resolve({
        allConversationsWithMessage: allConversationsWithMessage
      });
    } catch (error) {
      reject(error)
    }
  });
};

module.exports = {
  getAllConversationItems: getAllConversationItems
};