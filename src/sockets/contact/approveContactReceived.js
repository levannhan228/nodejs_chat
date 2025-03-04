import { pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray } from './../../helpers/socketHelper'
let approveRequestContactReceived = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    //thêm soket id vào array mỗi khi mở tab or reset 
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id)
    socket.on("approve-request-contact-received", (data) => {
      let currentUser = {
        id: socket.request.user._id,
        username: socket.request.user.username,
        avatar: socket.request.user.avatar,
        address: (socket.request.user.address !== null) ? socket.request.user.address : ""
      };

      //băn về 2 thông báo nếu mở 2 tab cùng một tài khoản
      if (clients[data.contactId]) {
        emitNotifyToArray(clients, data.contactId, io, "response-approve-request-received", currentUser);
      }
    });

    socket.on("disconnect", () => {
      clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
    });

    // console.log(clients)
  });
};

module.exports = approveRequestContactReceived;