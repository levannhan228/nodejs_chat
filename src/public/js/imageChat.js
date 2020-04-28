function bufferToBase64(buffer) {
  return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
}
function imageChat(divId) {
  $(`#image-chat-${divId}`).unbind("change").on("change", function () {
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

    let targetId = $(this).data("chat");
    let isChatGroup = false;

    let messageFormData = new FormData();
    messageFormData.append("my-image-chat", fileData);
    messageFormData.append("uid", targetId);

    if ($(this).hasClass("chat-in-group")) {
      messageFormData.append("isChatGroup", true);
      isChatGroup = true;
    }

    $.ajax({
      url: "/message/add-new-image",
      type: "post",
      cache: false,
      contentType: false,
      processData: false,
      data: messageFormData,
      success: function (data) {
        console.log(data);//trong data có data con nên chấm data.data fix sml mới ra
        let dataToEmit = {
          message: data.message
        };
        // xử lí trước khi đẩy ra chat sau khi chat
        let messageOfMe = $(`<div class="bubble me bubble-image-file" data-mess-id="${data.message._id}"></div>`);
        let imageChat = `<img src="data:${data.message.file.contentType}; base64,${bufferToBase64(data.message.file.data.data)}"
      class="show-image-chat">`;
        if (isChatGroup) {
          let senderavatar = ` <img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}"/>`;
          messageOfMe.html(`${senderavatar} ${imageChat}`)
          increaseMassageInGroup(divId);
          dataToEmit.groupId = targetId;
        } else {
          messageOfMe.html(imageChat);

          dataToEmit.contactId = targetId;
        }
        // đẩy ra màn hình
        $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
        nineScrollRight(divId);
        // thay đổi tin nhắn cuối và thời gian cập nhật bên danh sách left
        $(`.person[data-chat=${divId}]`).find("span.time").removeClass("new-message-css").html(moment(data.message.createdAt).locale("vi").startOf("seconds").fromNow());
        $(`.person[data-chat=${divId}]`).find("span.preview").html("Hình ảnh...");
        // closest : tìm gần nhất
        // đẩy lên trên cùng đối với tin nhắn mới nhất lại bên left 
        $(`.person[data-chat=${divId}]`).on("tensukien.namespace_nhan", function () {
          let dataToMove = $(this).parent();
          $(this).closest("ul").prepend(dataToMove);
          $(this).off("tensukien.namespace_nhan");
        });
        $(`.person[data-chat=${divId}]`).trigger("tensukien.namespace_nhan");
        // gửi sự kiện lên sever để xử lí realtime
        socket.emit("chat-image", dataToEmit);
        // đẩy hình ảnh vào thư viện ảnh
        let imageChatToAddModal = `<img src="data:${data.message.file.contentType}; base64,${bufferToBase64(data.message.file.data.data)}">`;
        $(`#imagesModal_${divId}`).find("div.all-images").append(imageChatToAddModal);
      },
      error: function (error) {
        alertify.notify(error.responseText, "error", 5)
      }
    });
  });
}

$(document).ready(function () {
  socket.on("response-chat-image", function (response) {
    let divId = "";
    // xử lí trước khi đẩy ra chat sau khi chat
    let messageOfYou = $(`<div class="bubble you bubble-image-file" data-mess-id="${response.message._id}"></div>`);
    let imageChat = `<img src="data:${response.message.file.contentType}; base64,${bufferToBase64(response.message.file.data.data)}" class="show-image-chat">`;
    // conver lần nữa khúc này mình chat lên nên khúc cover lúc lôi từ data không xài được
    if (response.currentGroupId) {
      let senderavatar = ` <img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}"/>`;
      messageOfYou.html(`${senderavatar} ${imageChat}`)
      divId = response.currentGroupId;

      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        increaseMassageInGroup(divId);
      }
    } else {
      messageOfYou.html(imageChat);
      divId = response.currentUserId;
    }
    // đẩy ra màn hình
    if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
      $(`.right .chat[data-chat=${divId}]`).append(messageOfYou);
      nineScrollRight(divId);
      $(`.person[data-chat=${divId}]`).find("span.time").addClass("new-message-css")
    }
    // thay đổi tin nhắn cuối và thời gian cập nhật bên danh sách left
    $(`.person[data-chat=${divId}]`).find("span.time").html(moment(response.message.createdAt).locale("vi").startOf("seconds").fromNow());
    $(`.person[data-chat=${divId}]`).find("span.preview").html("Hình ảnh...");
    // đẩy lên trên cùng đối với tin nhắn mới nhất lại bên left 
    $(`.person[data-chat=${divId}]`).on("tensukien.namespace_nhan", function () {
      let dataToMove = $(this).parent();
      $(this).closest("ul").prepend(dataToMove);
      $(this).off("tensukien.namespace_nhan");
    });
    $(`.person[data-chat=${divId}]`).trigger("tensukien.namespace_nhan");
     // đẩy hình ảnh vào thư viện ảnh
  if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
    let imageChatToAddModal = `<img src="data:${response.message.file.contentType}; base64,${bufferToBase64(response.message.file.data.data)}">`;
    $(`#imagesModal_${divId}`).find("div.all-images").append(imageChatToAddModal);
    }
  });
});