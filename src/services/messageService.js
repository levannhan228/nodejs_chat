import ContactModel from './../models/contactModel';
import UserModel from './../models/userModel';
import ChatGroupModel from './../models/chatGroupModel';
import MessageModel from './../models/MessageModel';
import _ from 'lodash';
import {transErrors} from './../../lang/vi';
import {app} from './../config/app'

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

let addnewTextEmoji = (sender, receivedId, messageVal, isChatGroup) =>{
  return new Promise(async(resolve,reject)=>{
    try {
      if(isChatGroup){
        let getChatGroupReceived = await ChatGroupModel.getChatGroupById(receivedId);
        if(!getChatGroupReceived){
          return reject(transErrors.conversation_not_found);
        }
        let recived = {
          id: getChatGroupReceived._id,
          name: getChatGroupReceived.name,
          avatar: app.general_avatar_group_chat
        };

        let newMessageItem ={
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
        await ChatGroupModel.updateWhenHasNewMessage(getChatGroupReceived._id,getChatGroupReceived.messageAmount + 1);
        resolve(newMessage);
      }else{
        let getUserReceived = await UserModel.getNormalUserDataById(receivedId);
        if(!getUserReceived){
          return reject(transErrors.conversation_not_found);
        }
        let recived = {
          id: getUserReceived._id,
          name: getUserReceived.username,
          avatar: getUserReceived.avatar
        }; 
        let newMessageItem ={
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
module.exports = {
  getAllConversationItems: getAllConversationItems,
  addnewTextEmoji: addnewTextEmoji
};