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

            // xóa bên leftSide nếu hủy kết bạn user1
            // kiểm tra active
            let checkActive = $("#all-chat").find(`li[data-chat=${targetId}]`).hasClass("active");
            // xóa bên leftSide
            $("#all-chat").find(`ul a[href = "#uid_${targetId}"]`).remove();
            $("#user-chat").find(`ul a[href = "#uid_${targetId}"]`).remove();

            // xóa bên rightSide
            $("#screen-chat").find(`div#to_${targetId}`).remove();
            // xóa modal hình ảnh
            $("body").find(`div#imagesModal_${targetId}`).remove();
            // xóa modal tệp đính kèm
            $("body").find(`div#attachmentModal_${targetId}`).remove();
            // click người dùng đầu tiên trong list contact
            if (checkActive) {
              $("ul.people").find("a")[0].click();
            }
          }
        }
      });
    });
  });
}


socket.on("response-remove-contact", function (user) {
  $("#contacts").find(`ul li[data-uid=${user.id}]`).remove();
  decreaseNumberNotifContact("count-contacts"); //js/caculateNotifContact.js
  // xóa bên leftSide nếu hủy kết bạn user2
  // kiểm tra active
  let checkActive = $("#all-chat").find(`li[data-chat=${user.id}]`).hasClass("active");
  // xóa bên leftSide
  $("#all-chat").find(`ul a[href = "#uid_${user.id}"]`).remove();
  $("#user-chat").find(`ul a[href = "#uid_${user.id}"]`).remove();

  // xóa bên rightSide
  $("#screen-chat").find(`div#to_${user.id}`).remove();
  // xóa modal hình ảnh
  $("body").find(`div#imagesModal_${user.id}`).remove();
  // xóa modal tệp đính kèm
  $("body").find(`div#attachmentModal_${user.id}`).remove();
  // click người dùng đầu tiên trong list contact
  if (checkActive) {
    $("ul.people").find("a")[0].click();
  }
});

$(document).ready(function () {
  removeContact();
});
