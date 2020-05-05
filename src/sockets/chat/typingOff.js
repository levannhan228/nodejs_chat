import { pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray } from './../../helpers/socketHelper'
let typingOff = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    //thêm soket id vào array mỗi khi mở tab or reset 
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
    socket.request.user.chatGroupIds.forEach(group => {
      clients = pushSocketIdToArray(clients, group._id, socket.id);
    });

    // khi tạo group chat để xử lý real-time các xử lí chat cần nhận được id group và socketid của các thành viên để xử lí
    socket.on("new-group-created", (data) => {
      clients = pushSocketIdToArray(clients, data.groupChat._id, socket.id);
    });
    socket.on("member-received-group-chat",(data) =>{
      clients = pushSocketIdToArray(clients, data.groupChatId, socket.id);
    });

    socket.on("some-one-not-chat", (data) => {
      if (data.groupId) {
        let response = {
          currentGroupId: data.groupId,
          currentUserId: socket.request.user._id
        };
        //băn về 2 thông báo nếu mở 2 tab cùng một tài khoản
        if (clients[data.groupId]) {
          emitNotifyToArray(clients, data.groupId, io, "response-some-one-not-chat", response);
        }
      }
      if (data.contactId) {
        let response = {
          currentUserId: socket.request.user._id
        };
        //băn về 2 thông báo nếu mở 2 tab cùng một tài khoản
        if (clients[data.contactId]) {
          emitNotifyToArray(clients, data.contactId, io, "response-some-one-not-chat", response);
        }
      }
    });

    socket.on("disconnect", () => {
      clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
      socket.request.user.chatGroupIds.forEach(group => {
        clients = removeSocketIdFromArray(clients, group._id, socket);
      });
    });

    // console.log(clients)
  });
};

module.exports = typingOff;