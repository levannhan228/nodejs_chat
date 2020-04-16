function markNotificationAsRead(targetUsers) {
  $.ajax({
    url: "/notification/mark-all-ad-read",
    type: "put",
    data: { targetUsers: targetUsers },
    success: function (result) {
      if (result) {
        targetUsers.forEach(function (uid) {
          $(".noti_content").find(`div[data-uid= ${uid}]`).removeClass("notif-readed-false");
          $("ul.list-notifications").find(`li>div.div[data-uid= ${uid}]`).removeClass("notif-readed-false");
        });
        decreaseNumberNotification("noti_counter", targetUsers.length);
      }
    }
  });
}

$(document).ready(function () {
  //notif
  $("#notif-by-nhan").bind("click", function () {
    let targetUsers = [];
    $(".noti_content").find("div.notif-readed-false").each(function (index, notification) {
      targetUsers.push($(notification).data("uid"));
    });
    if (!targetUsers.length) {
      alertify.notify("bạn đã đọc hết thông báo", "error", 5);
      return false;
    }
    markNotificationAsRead(targetUsers);
  });
  //modal
  $("#modal-notif-by-nhan").bind("click", function () {
    let targetUsers = [];
    $("ul.list-notifications").find("li>div.notif-readed-false").each(function (index, notification) {
      targetUsers.push($(notification).data("uid"));
    });
    if (!targetUsers.length) {
      alertify.notify("bạn đã đọc hết thông báo", "error", 5);
      return false;
    }
    markNotificationAsRead(targetUsers);
  });
});