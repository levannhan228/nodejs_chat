// chuyển màu xanh nếu online
socket.on("sever-send-list-users-online", function (listUserIds) {
  listUserIds.forEach(userId => {
    $(`.person[data-chat=${userId}]`).find("div.dot").addClass("online");
    $(`.person[data-chat=${userId}]`).find("img").addClass("avatar-online");
  });
});
// real-time nếu online
socket.on("server-send-when-new-user-online",function(userId){
  $(`.person[data-chat=${userId}]`).find("div.dot").addClass("online");
  $(`.person[data-chat=${userId}]`).find("img").addClass("avatar-online");
})
// real-time nếu logout chuyển màu xàm offline ban đầu
socket.on("server-send-when-new-user-offline",function(userId){
  $(`.person[data-chat=${userId}]`).find("div.dot").removeClass("online");
  $(`.person[data-chat=${userId}]`).find("img").removeClass("avatar-online");
})