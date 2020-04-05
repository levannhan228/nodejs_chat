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
    return this.remove({
      $and: [
        {$or: [
          {"userId": userId},
          {"contactId": contactId}
        ]},
        { "contactId": contactId }
      ]
    }).exec()
  },
  // lấy danh sách bạn bè
  getContact(userId, limit) {
    return this.find({
      $and: [
        { "userId": userId },
        { "status": true }
      ]
    }).sort({ "createdAt": -1 }).limit(limit).exec()
  },
  // lấy danh sách chờ xác nhận bạn bè me -> you
  getContactsSent(userId, limit) {
    return this.find({
      $and: [
        { "userId": userId },
        { "status": false }
      ]
    }).sort({ "createdAt": -1 }).limit(limit).exec()
  },
  // lấy danh sách chờ xác nhận bạn bè you -> me
  getContactsReceived(userId, limit) {
    return this.find({
      $and: [
        { "contactId": userId },
        { "status": false }
      ]
    }).sort({ "createdAt": -1 }).limit(limit).exec()
  },

  // đếm số bạn bè
  countAllContacts(userId) {
    return this.count({
      $and: [
        { "userId": userId },
        { "status": true }
      ]
    }).exec()
  },
  // đếm danh sách chờ xác nhận bạn bè me -> you
  countAllContactsSent(userId) {
    return this.count({
      $and: [
        { "userId": userId },
        { "status": false }
      ]
    }).exec()
  },
  // đếm danh sách chờ xác nhận bạn bè you -> me
  countAllContactsReceived(userId) {
    return this.count({
      $and: [
        { "contactId": userId },
        { "status": false }
      ]
    }).exec()
  },
};
module.exports = mongoose.model("contact", ContactSchema);