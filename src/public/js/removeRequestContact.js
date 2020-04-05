function removeRequestContact() {
  $(".user-remove-request-contact").bind("click", function () {
    let targetId = $(this).data("uid");
    $.ajax({
      url: "/contact/remove-request-contact",
      type: "delete",
      data: { uid: targetId },
      success: function (data) {
        if (data.success) {
          $("#find-user").find(`div.user-remove-request-contact[data-uid=${targetId}]`).hide();
          $("#find-user").find(`div.user-add-new-contact[data-uid=${targetId}]`).css("display", "inline-block");
          decreaseNumberNotifContact("count-request-contact-sent");
          // xóa modal tab đang chờ xác nhận
          $("#request-contact-sent").find(`li[data-uid = ${targetId}]`).remove();

          socket.emit("remove-request-contact", { contactId: targetId });
        }
      }
    });
  });
}


socket.on("response-remove-request-contact", function (user) {
  $(".noti_content").find(`div[data-uid = ${user.id}]`).remove();//navbar
  $("ul.list-notifications").find(`li>div[data-uid = ${user.id}]`).parent().remove();

  //xóa modal tab yêu cầu kết bạn
  $("#request-contact-received").find(`li[data-uid] = ${user.id}`).remove();
  decreaseNumberNotifContact("count-request-contact-received");

  decreaseNumberNotification("noti_contact_counter", 1);
  decreaseNumberNotification("noti_counter", 1);
});
