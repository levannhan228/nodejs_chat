import mongoose from "mongoose";
let Schema = mongoose.Schema;

let ContactSchema = new Schema({
  userId: String,
  contactId: String,
  status: { type: Boolean, default: false },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: null },
  deletedAt: { type: Number, default: null },
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

  removeContact(userId, contacId) {
    return this.remove({
      $or: [
        {
          $and: [
            { "userId": userId },
            { "contactId": contacId },
            { "status": true }
          ]
        },
        {
          $and: [
            { "userId": contacId },
            { "contactId": userId },
            { "status": true }
          ]
        },
      ]
    }).exec();
  },

  removeRequestContactSent(userId, contactId) {
    return this.remove({
      $and: [
        { "userId": userId },
        { "contactId": contactId },
        { "status": false }
      ]
    }).exec()
  },

  removeRequestContactReceived(userId, contactId) {
    return this.remove({
      $and: [
        { "contactId": userId },
        { "userId": contactId },
        { "status": false }
      ]
    }).exec()
  },

  approveRequestContactReceived(userId, contactId) {
    return this.update({
      $and: [
        { "contactId": userId },
        { "userId": contactId },
        { "status": false }
      ]
    }, {
      "status": true,
      "updatedAt": Date.now()
    }).exec()
  },

  // lấy danh sách bạn bè
  getContacts(userId, limit) {
    return this.find({
      $and: [
        {
          $or: [
            { "userId": userId },
            { "contactId": userId }
          ]
        },
        { "status": true }
      ]
    }).sort({ "updatedAt": -1 }).limit(limit).exec();
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
    }).sort({ "createdAt": -1 }).limit(limit).exec();
  },

  // đếm số bạn bè
  countAllContacts(userId) {
    return this.count({
      $and: [
        {
          $or: [
            { "userId": userId },
            { "contactId": userId }
          ]
        },
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
  // readmore số bạn bè
  readMoreContacts(userId, skip, limit) {
    return this.find({
      $and: [
        {
          $or: [
            { "userId": userId },
            { "contactId": userId }
          ]
        },
        { "status": true }
      ]
    }).sort({ "updatedAt": -1 }).skip(skip).limit(limit).exec();
  },
  // readmore danh sách chờ xác nhận bạn bè me -> you
  readMoreContactsSent(userId, skip, limit) {
    return this.find({
      $and: [
        { "userId": userId },
        { "status": false }
      ]
    }).sort({ "createdAt": -1 }).skip(skip).limit(limit).exec()
  },
  // readmore danh sách chờ xác nhận bạn bè you -> me
  readMoreContactsReceived(userId, skip, limit) {
    return this.find({
      $and: [
        { "contactId": userId },
        { "status": false }
      ]
    }).sort({ "createdAt": -1 }).skip(skip).limit(limit).exec();
  },
};
module.exports = mongoose.model("contact", ContactSchema);