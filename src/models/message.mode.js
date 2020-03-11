import mongoose from "mongoose";
let Schema = mongoose.Schema;

let MessageSchema = new Schema({
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
  createAt: { type: Number, default: Date.now },
  updateAt: { type: Number, default: null },
  deleteAt: { type: Number, default: null },
});

module.exports = mongoose.model("massage", MessageSchema);