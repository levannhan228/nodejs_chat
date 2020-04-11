function removeContact() {
  $(".user-remove-contact").unbind("click").on("click", function () {
    let targetId = $(this).data("uid");
    let username = $(this).parent().find("div.user-name p").text();
    Swal.fire({
      title: `Bạn có chắc chắn muốn hủy kết bạn với ${username} ?`,
      text: `Người dùng ${username} sẽ bị xóa khỏi danh bạ của bạn`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2ECC71",
      cancelButtonColor: "#ff7675",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy"
    }).then((result) => {
      if (!result.value) {
        return false
      }
      $.ajax({
        url: "/contact/remove-contact",
        type: "delete",
        data: { uid: targetId },
        success: function (data) {
          if (data.success) {
            $("#contacts").find(`ul li[data-uid=${targetId}]`).remove();
            decreaseNumberNotifContact("count-contacts"); //js/caculateNotifContact.js

            socket.emit("remove-contact", { contactId: targetId });
          }
        }
      });
    });
  });
}


socket.on("response-remove-contact", function (user) {
  $("#contacts").find(`ul li[data-uid=${user.id}]`).remove();
  decreaseNumberNotifContact("count-contacts"); //js/caculateNotifContact.js

});

$(document).ready(function () {
  removeContact();
});
