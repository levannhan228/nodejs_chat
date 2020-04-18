import mongoose from "mongoose";
let Schema = mongoose.Schema;

let MessageSchema = new Schema({
  senderId: String,
  receiverId: String,
  conversationType: String,
  messageType: String,
  sender: {
    id: String,
    username: String,
    avatar: String
  },
  receiver: {
    id: String,
    username: String,
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
  //senderId = người dùng hiện tại
  getMessages(senderId, receiverId, limit) {
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
    }).sort({ "createdAt": 1 }).limit(limit).exec();
  }
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