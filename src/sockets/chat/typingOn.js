import { pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray } from './../../helpers/socketHelper'
let typingOn = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    //thêm soket id vào array mỗi khi mở tab or reset 
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
    socket.request.user.chatGroupIds.forEach(group => {
      clients = pushSocketIdToArray(clients, group._id, socket.id);
    });
    socket.on("some-one-chat", (data) => {
      if (data.groupId) {
        let response = {
          currentGroupId: data.groupId,
          currentUserId: socket.request.user._id
        };
        //băn về 2 thông báo nếu mở 2 tab cùng một tài khoản
        if (clients[data.groupId]) {
          emitNotifyToArray(clients, data.groupId, io, "response-some-one-chat", response);
        }
      }
      if (data.contactId) {
        let response = {
          currentUserId: socket.request.user._id
        };
        //băn về 2 thông báo nếu mở 2 tab cùng một tài khoản
        if (clients[data.contactId]) {
          emitNotifyToArray(clients, data.contactId, io, "response-some-one-chat", response);
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

module.exports = typingOn;