import { pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray } from './../../helpers/socketHelper'
let chatTextEmoji = (io) => {
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

    
    socket.on("chat-text-emoji", (data) => {
      if (data.groupId) {
        let response = {
          currentGroupId: data.groupId,
          currentUserId: socket.request.user._id,
          message: data.message
        };
        //băn về 2 thông báo nếu mở 2 tab cùng một tài khoản
        if (clients[data.groupId]) {
          emitNotifyToArray(clients, data.groupId, io, "response-chat-text-emoji", response);
        }
      }
      if (data.contactId) {
        let response = {
          currentUserId: socket.request.user._id,
          message: data.message
        };
        //băn về 2 thông báo nếu mở 2 tab cùng một tài khoản
        if (clients[data.contactId]) {
          emitNotifyToArray(clients, data.contactId, io, "response-chat-text-emoji", response);
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

module.exports = chatTextEmoji;