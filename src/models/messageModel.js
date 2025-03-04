import mongoose from "mongoose";
let Schema = mongoose.Schema;

let MessageSchema = new Schema({
  senderId: String,
  receiverId: String,
  conversationType: String,
  messageType: String,
  sender: {
    id: String,
    name: String,
    avatar: String
  },
  receiver: {
    id: String,
    name: String,
    avatar: String
  },
  text: String,
  file: { data: Buffer, contentType: String, fileName: String },
  userId: String,
  contacId: String,
  status: { type: Boolean, default: false },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: null },
  deletedAt: { type: Number, default: null },
});

MessageSchema.statics = {

  createNew(item) {
    return this.create(item);
  },
  //senderId = người dùng hiện tại
  /**
   * 
   * @param {string} senderId 
   * @param {string} receiverId 
   * @param {number} limit 
   */
  getMessagesInPersonal(senderId, receiverId, limit) {
    return this.find({
      $or: [
        {
          $and: [
            { "senderId": senderId },
            { "receiverId": receiverId }
          ]
        },
        {

          $and: [
            { "receiverId": senderId },
            { "senderId": receiverId }
          ]
        }
      ]
    }).sort({ "createdAt": -1 }).limit(limit).exec();
  },
  /**
   * 
   * @param {string} receiverId 
   * @param {number} limit 
   */
  getMessagesInGroup(receiverId, limit) {
    return this.find({ "receiverId": receiverId }).sort({ "createdAt": -1 }).limit(limit).exec();
  },

  readMoreMessagesInPersonal(senderId, receiverId, skip, limit) {
    return this.find({
      $or: [
        {
          $and: [
            { "senderId": senderId },
            { "receiverId": receiverId }
          ]
        },
        {

          $and: [
            { "receiverId": senderId },
            { "senderId": receiverId }
          ]
        }
      ]
    }).sort({ "createdAt": -1 }).skip(skip).limit(limit).exec();
  },

  readMoreMessagesInGroup(receiverId, skip, limit) {
    return this.find({ "receiverId": receiverId }).sort({ "createdAt": -1 }).skip(skip).limit(limit).exec();
  },
};
const MESSAGE_CONVERSATION_TYPES = {
  PERSONAL: "personal",
  GROUP: "group",
};

const MESSGAGE_TYPES = {
  TEXT: "text",
  IMG: "image",
  FILE: "file"
}
module.exports = {
  model: mongoose.model("massage", MessageSchema),
  conversationTypes: MESSAGE_CONVERSATION_TYPES,
  messagetypes: MESSGAGE_TYPES
};