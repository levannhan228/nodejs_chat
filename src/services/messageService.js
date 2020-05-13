import ContactModel from './../models/contactModel';
import UserModel from './../models/userModel';
import ChatGroupModel from './../models/chatGroupModel';
import MessageModel from './../models/MessageModel';
import _ from 'lodash';
import { transErrors } from './../../lang/vi';
import { app } from './../config/app';
import fsExtra from "fs-extra";

const LIMIT_CONVERSATIONS_TAKEN = 10;
const LIMIT_MESSAGES_TAKEN = 40;

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
        if (converations.members) {
          let getMessages = await MessageModel.model.getMessagesInGroup(converations._id, LIMIT_MESSAGES_TAKEN);
          converations.messages = _.reverse(getMessages);
        } else {
          let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, converations._id, LIMIT_MESSAGES_TAKEN);
          converations.messages = _.reverse(getMessages);
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

let addnewTextEmoji = (sender, receivedId, messageVal, isChatGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isChatGroup) {
        let getChatGroupReceived = await ChatGroupModel.getChatGroupById(receivedId);
        if (!getChatGroupReceived) {
          return reject(transErrors.conversation_not_found);
        }
        let recived = {
          id: getChatGroupReceived._id,
          name: getChatGroupReceived.name,
          avatar: app.general_avatar_group_chat
        };

        let newMessageItem = {
          senderId: sender.id,
          receiverId: recived.id,
          conversationType: MessageModel.conversationTypes.GROUP,
          messageType: MessageModel.messagetypes.TEXT,
          sender: sender,
          receiver: recived,
          text: messageVal,
          createdAt: Date.now()
        };
        //create new mess 
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        // update group
        await ChatGroupModel.updateWhenHasNewMessage(getChatGroupReceived._id, getChatGroupReceived.messageAmount + 1);
        resolve(newMessage);
      } else {
        let getUserReceived = await UserModel.getNormalUserDataById(receivedId);
        if (!getUserReceived) {
          return reject(transErrors.conversation_not_found);
        }
        let recived = {
          id: getUserReceived._id,
          name: getUserReceived.username,
          avatar: getUserReceived.avatar
        };
        let newMessageItem = {
          senderId: sender.id,
          receiverId: recived.id,
          conversationType: MessageModel.conversationTypes.PERSONAL,
          messageType: MessageModel.messagetypes.TEXT,
          sender: sender,
          receiver: recived,
          text: messageVal,
          createdAt: Date.now()
        };
        //create new mess
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        // update contact
        await ContactModel.updateWhenHasNewMessage(sender.id, getUserReceived._id);
        resolve(newMessage);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let addNewImage = (sender, receivedId, messageVal, isChatGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isChatGroup) {
        let getChatGroupReceived = await ChatGroupModel.getChatGroupById(receivedId);
        if (!getChatGroupReceived) {
          return reject(transErrors.conversation_not_found);
        }
        let recived = {
          id: getChatGroupReceived._id,
          name: getChatGroupReceived.name,
          avatar: app.general_avatar_group_chat
        };

        let imageBuffer = await fsExtra.readFile(messageVal.path);
        let imageContentType = messageVal.mimetype;
        let imageName = messageVal.originalname;

        let newMessageItem = {
          senderId: sender.id,
          receiverId: recived.id,
          conversationType: MessageModel.conversationTypes.GROUP,
          messageType: MessageModel.messagetypes.IMG,
          sender: sender,
          receiver: recived,
          file: { data: imageBuffer, contentType: imageContentType, fileName: imageName },
          createdAt: Date.now()
        };
        //create new mess 
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        // update group
        await ChatGroupModel.updateWhenHasNewMessage(getChatGroupReceived._id, getChatGroupReceived.messageAmount + 1);
        resolve(newMessage);
      } else {
        let getUserReceived = await UserModel.getNormalUserDataById(receivedId);
        if (!getUserReceived) {
          return reject(transErrors.conversation_not_found);
        }
        let recived = {
          id: getUserReceived._id,
          name: getUserReceived.username,
          avatar: getUserReceived.avatar
        };
        let imageBuffer = await fsExtra.readFile(messageVal.path);
        let imageContentType = messageVal.mimetype;
        let imageName = messageVal.originalname;

        let newMessageItem = {
          senderId: sender.id,
          receiverId: recived.id,
          conversationType: MessageModel.conversationTypes.PERSONAL,
          messageType: MessageModel.messagetypes.IMG,
          sender: sender,
          receiver: recived,
          file: { data: imageBuffer, contentType: imageContentType, fileName: imageName },
          createdAt: Date.now()
        };
        //create new mess
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        // update contact
        await ContactModel.updateWhenHasNewMessage(sender.id, getUserReceived._id);
        resolve(newMessage);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let addNewAttachment = (sender, receivedId, messageVal, isChatGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isChatGroup) {
        let getChatGroupReceived = await ChatGroupModel.getChatGroupById(receivedId);
        if (!getChatGroupReceived) {
          return reject(transErrors.conversation_not_found);
        }
        let recived = {
          id: getChatGroupReceived._id,
          name: getChatGroupReceived.name,
          avatar: app.general_avatar_group_chat
        };

        let attachmentBuffer = await fsExtra.readFile(messageVal.path);
        let attachmentContentType = messageVal.mimetype;
        let attachmentName = messageVal.originalname;

        let newMessageItem = {
          senderId: sender.id,
          receiverId: recived.id,
          conversationType: MessageModel.conversationTypes.GROUP,
          messageType: MessageModel.messagetypes.FILE,
          sender: sender,
          receiver: recived,
          file: { data: attachmentBuffer, contentType: attachmentContentType, fileName: attachmentName },
          createdAt: Date.now()
        };
        //create new mess 
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        // update group
        await ChatGroupModel.updateWhenHasNewMessage(getChatGroupReceived._id, getChatGroupReceived.messageAmount + 1);
        resolve(newMessage);
      } else {
        let getUserReceived = await UserModel.getNormalUserDataById(receivedId);
        if (!getUserReceived) {
          return reject(transErrors.conversation_not_found);
        }
        let recived = {
          id: getUserReceived._id,
          name: getUserReceived.username,
          avatar: getUserReceived.avatar
        };
        let attachmentBuffer = await fsExtra.readFile(messageVal.path);
        let attachmentContentType = messageVal.mimetype;
        let attachmentName = messageVal.originalname;

        let newMessageItem = {
          senderId: sender.id,
          receiverId: recived.id,
          conversationType: MessageModel.conversationTypes.PERSONAL,
          messageType: MessageModel.messagetypes.FILE,
          sender: sender,
          receiver: recived,
          file: { data: attachmentBuffer, contentType: attachmentContentType, fileName: attachmentName },
          createdAt: Date.now()
        };
        //create new mess
        let newMessage = await MessageModel.model.createNew(newMessageItem);
        // update contact
        await ContactModel.updateWhenHasNewMessage(sender.id, getUserReceived._id);
        resolve(newMessage);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * xem thêm trò chuyện cá nhân và group
 * @param {string} currentUserId 
 * @param {number} skipPersonal 
 * @param {number} skipGroup 
 */
let readMoreAllChat = (currentUserId, skipPersonal, skipGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      let contacts = await ContactModel.readMoreContacts(currentUserId, skipPersonal, LIMIT_CONVERSATIONS_TAKEN);
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

      let groupConversations = await ChatGroupModel.readMoreChatGroups(currentUserId, skipGroup, LIMIT_CONVERSATIONS_TAKEN);
      let allConversations = userConversations.concat(groupConversations);

      allConversations = _.sortBy(allConversations, (item) => {
        return -item.updatedAt;
      });

      // lấy tin nhắn đẩy vào màn hình
      let allConversationsWithMessagePromise = allConversations.map(async (converations) => {
        converations = converations.toObject();
        if (converations.members) {
          let getMessages = await MessageModel.model.getMessagesInGroup(converations._id, LIMIT_MESSAGES_TAKEN);
          converations.messages = _.reverse(getMessages);
        } else {
          let getMessages = await MessageModel.model.getMessagesInPersonal(currentUserId, converations._id, LIMIT_MESSAGES_TAKEN);
          converations.messages = _.reverse(getMessages);
        }
        return converations;
      });

      let allConversationsWithMessage = await Promise.all(allConversationsWithMessagePromise);
      // sắp xếp lại lần nữa cho chắc kèo
      allConversationsWithMessage = _.sortBy(allConversationsWithMessage, (item) => {
        return -item.updatedAt;
      });
      resolve(allConversationsWithMessage);
    } catch (error) {
      reject(error)
    }
  });
}

/**
 * 
 * @param {string} currentUserId 
 * @param {number} skipMessage 
 * @param {string} targetId 
 * @param {boolean} chatInGroup 
 */
let readMore = (currentUserId, skipMessage, targetId, chatInGroup) => {
  return new Promise(async (resolve, reject) => {
    try {
      // message in group
      if (chatInGroup) {
        let getMessages = await MessageModel.model.readMoreMessagesInGroup(targetId, skipMessage, LIMIT_MESSAGES_TAKEN);
        getMessages = _.reverse(getMessages);
        return resolve(getMessages);
      } 
      // message in personal
      let getMessages = await MessageModel.model.readMoreMessagesInPersonal(currentUserId, targetId, skipMessage, LIMIT_MESSAGES_TAKEN);
      getMessages = _.reverse(getMessages);
      return resolve(getMessages);
      
    } catch (error) {
      reject(error)
    }
  });
}
module.exports = {
  getAllConversationItems: getAllConversationItems,
  addnewTextEmoji: addnewTextEmoji,
  addNewImage: addNewImage,
  addNewAttachment: addNewAttachment,
  readMoreAllChat: readMoreAllChat,
  readMore: readMore
};