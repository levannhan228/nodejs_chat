import { pushSocketIdToArray, emitNotifyToArray, removeSocketIdFromArray } from './../../helpers/socketHelper'
let userOnlineOrOff = (io) => {
  let clients = {};
  io.on("connection", (socket) => {
    // thêm soket id vào array mỗi khi mở tab or reset 
    clients = pushSocketIdToArray(clients, socket.request.user._id, socket.id);
    socket.request.user.chatGroupIds.forEach(group => {
      clients = pushSocketIdToArray(clients, group._id, socket.id);
    });

    let listUsersOnline = Object.keys(clients)
    // gửi sự kiện sau khi login hoặc f5 trang web (vì mỗi lần như thế thằng socket lại tạo một id ngẫu nhiên)
    socket.emit("sever-send-list-users-online", listUsersOnline);
    // gửi sự kiện đến tất cả thành viên đang online nếu 1 ai đó login (nó sẽ không bắn cho thằng mới login) vào (real-time)
    socket.broadcast.emit("server-send-when-new-user-online", socket.request.user._id);

    socket.on("disconnect", () => {
      clients = removeSocketIdFromArray(clients, socket.request.user._id, socket);
      socket.request.user.chatGroupIds.forEach(group => {
        clients = removeSocketIdFromArray(clients, group._id, socket);
      });
      // gửi sự kiện nếu logout để chuyển màu xám
      socket.broadcast.emit("server-send-when-new-user-offline", socket.request.user._id);
    });

    // console.log(clients)
  });
};

module.exports = userOnlineOrOff;