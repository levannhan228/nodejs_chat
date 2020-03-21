let userAvatar = null;
let userInfo = {};
let originAvatarSrc = null;
function updateUserInfo() {
  $("#input-change-avatar").bind("change", function () {
    let fileData = $(this).prop("files")[0];
    let math = ["image/png", "image/jpg", "image/jpeg"];
    let limit = 10485763; // byte = 1MB

    if ($.inArray(fileData.type, math) === -1) {
      alertify.notify("Định dạng không phù hợp, vui lòng chọn file jpg & png.", "error", 5);
      $(this).val(null);
      return false;
    }

    if (fileData.size > limit) {
      alertify.notify("Kích thước ảnh không phù hợp phải < 1MB", "error", 5);
      $(this).val(null);
      return false;
    }
    if (typeof (FileReader) != "undefined") {
      let imagePreview = $("#image-edit-profile");
      imagePreview.empty();
      let fileReader = new FileReader();
      fileReader.onload = function (element) {
        $("<img>", {
          "src": element.target.result,
          "class": "avatar img-circle",
          "id": "user-modal-avatar",
          "alt": "avatar"
        }).appendTo(imagePreview);
      }
      imagePreview.show();
      fileReader.readAsDataURL(fileData);

      let formData = new FormData();
      formData.append("avatar", fileData);

      userAvatar = formData;
    } else {
      alertify.notify("Trình duyệt của bạn không hỗ trợ FileReader", "error", 5);
    }
  });

  $("#input-change-username").bind("change", function () {
    userInfo.username = $(this).val();
  });

  $("#input-change-gender-male").bind("click", function () {
    userInfo.gender = $(this).val();
  });

  $("#input-change-gender-female").bind("click", function () {
    userInfo.gender = $(this).val();
  });

  $("#input-change-address").bind("click", function () {
    userInfo.address = $(this).val();
  });

  $("#input-change-phone").bind("click", function () {
    userInfo.phone = $(this).val();
  });
}
$(document).ready(function () {
  updateUserInfo();
  originAvatarSrc = $("#user-modal-avatar").attr("src");
  $("#input-btn-update-user").bind("click", function () {
    if ($.isEmptyObject(userInfo) && !userAvatar) {
      alertify.notify("Bạn phải thay đổi thông tin trước khi cập nhật", "error", 5);
      return false
    }
    $.ajax({
      url: "/user/update-avatar",
      type: "put",
      cache: false,
      contentType: false,
      processData: false,
      data: userAvatar,
      success: function (result) {
        console.log(result);
        $(".user-modal-alter-success").find("span").text(result.message);
        $(".user-modal-alter-success").css("display", "block");
        // update image small in nabar
        $("#navbar-avatar").attr("src",result.imageSrc);

        originAvatarSrc = result.imageSrc;
        $("#input-btn-cancel-update-user").click();
      },
      error: function (error) {
        $(".user-modal-alter-error").find("span").text(error.responseText);
        $(".user-modal-alter-error").css("display", "block");

        $("#input-btn-cancel-update-user").click();
      }
    })
  });

  $("#input-btn-cancel-update-user").bind("click", function () {
    userAvatar = null;
    userInfo = {};
    $("#input-change-avatar").val(null);
    $("#user-modal-avatar").attr("src", originAvatarSrc)
  });
});