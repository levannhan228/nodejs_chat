import { notification, contact, message } from './../services/index';
import { bufferToBase64, lastItemOfArray, convertTimestampToHumanTime } from './../helpers/clientHelper';
let getHome = async (req, res) => {
  //10 thông báo hiển thị
  let notifications = await notification.getNotifications(req.user._id)

  let countNotifUnread = await notification.countNotifUnread(req.user._id);
  // list bạn bè
  let contacts = await contact.getContacts(req.user._id);
  // list gửi yêu cầu kết bạn
  let contactsSent = await contact.getContactsSent(req.user._id);
  // list xác nhận yêu cầu kêt bạn
  let contactsReceived = await contact.getContactsReceived(req.user._id);
  // đếm tổng số theo từng loại
  let countAllContacts = await contact.countAllContacts(req.user._id);
  let countAllContactsSent = await contact.countAllContactsSent(req.user._id);
  let countAllContactsReceived = await contact.countAllContactsReceived(req.user._id);
  //
  let getAllConversationItems = await message.getAllConversationItems(req.user._id);
  // lấy tất cả tin nhắn với dk limit
  let allConversationsWithMessage = getAllConversationItems.allConversationsWithMessage;

  return res.render("main/home/home", {
    errors: req.flash("errors"),
    success: req.flash("success"),
    user: req.user,
    notifications: notifications,
    countNotifUnread: countNotifUnread,
    contacts: contacts,
    contactsSent: contactsSent,
    contactsReceived: contactsReceived,
    countAllContacts: countAllContacts,
    countAllContactsSent: countAllContactsSent,
    countAllContactsReceived: countAllContactsReceived,
    allConversationsWithMessage: allConversationsWithMessage,
    bufferToBase64: bufferToBase64,
    lastItemOfArray: lastItemOfArray,
    convertTimestampToHumanTime: convertTimestampToHumanTime
  });
};

module.exports = {
  getHome: getHome
}