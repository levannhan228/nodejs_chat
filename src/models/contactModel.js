import mongoose from "mongoose";
let Schema = mongoose.Schema;

let ContactSchema = new Schema({
  userId: String,
  contactId: String,
  status: { type: Boolean, default: false },
  createAt: { type: Number, default: Date.now },
  updateAt: { type: Number, default: null },
  deleteAt: { type: Number, default: null },
});

ContactSchema.statics = {
  createNew(item) {
    return this.create(item);
  },

  findAllByUser(userId) {
    return this.find({
      $or: [
        { "userId": userId },
        { "contacId": userId },
      ]
    }).exec();
  },

  checkExists(userId, contacId) {
    return this.findOne({
      $or: [
        {
          $and: [
            { "userId": userId },
            { "contactId": contacId }
          ]
        },
        {
          $and: [
            { "userId": contacId },
            { "contactId": userId }
          ]
        },
      ]
    }).exec();
  },

  removeRequestContact(userId, contactId) {
    return this.remove().exec({
      $and: [
        { "userId": userId },
        { "contactId": contactId }
      ]
    })
  }
}
module.exports = mongoose.model("contact", ContactSchema);