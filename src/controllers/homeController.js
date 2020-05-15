import { notification, contact, message } from './../services/index';
import { bufferToBase64, lastItemOfArray, convertTimestampToHumanTime } from './../helpers/clientHelper';
import { reject } from 'bluebird';
import request from 'request';

let getICETurnServer = () => {
  return new Promise(async (resolve, reject) => {
    // lấy từ xirsys.net (web cho xài free turnsever 500mb xài tí là hết @@)
    let o = {
      format: "urls"
    };

    let bodyString = JSON.stringify(o);
    let options = {
      url: "https://global.xirsys.net/_turn/Chat-nodejs-LVN",
      // host: "global.xirsys.net",
      // path: "/_turn/Chat-nodejs-LVN",
      method: "PUT",
      headers: {
        "Authorization": "Basic " + Buffer.from("levannhan228:cadbba5a-8b77-11ea-8d66-0242ac150002").toString("base64"),
        "Content-Type": "application/json",
        "Content-Length": bodyString.length
      }
    };

    // đọc document của thư viện 'request' xài thằng này gọn code hơn https mặc định
    request(options, (error, response, body) => {
      if(error){
        console.log(error);
        return reject(error);
      }
      let bodyJson = JSON.parse(body);
      resolve(bodyJson.v.iceServers)
    });
    // resolve([]);
  });
};

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
  // lấy ICE từ xirsys turn server
  let iceServerList = await getICETurnServer()
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
    convertTimestampToHumanTime: convertTimestampToHumanTime,
    //chuyển trở lại để có thể đẩy lên client
    iceServerList : JSON.stringify(iceServerList)
  });
};

module.exports = {
  getHome: getHome
}