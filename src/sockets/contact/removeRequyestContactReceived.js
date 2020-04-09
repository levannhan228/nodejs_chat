import { pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray } from '../../helpers/socketHelper'
let removeRequestContactReceived = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    //thêm soket id vào array mỗi khi mở tab or reset 
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id)

    socket.on("remove-request-contact-received", (data) => {
      let currentUser = {
        id: socket.request.user._id
      };

      //băn về 2 thông báo nếu mở 2 tab cùng một tài khoản
      if (clients[data.contactId]) {
        emitNotifyToArray(clients, data.contactId, io, "response-remove-request-contact-received", currentUser);
      }
    });

    socket.on("disconnect", () => {
      clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
    });
  });
};

module.exports = removeRequestContactReceived;