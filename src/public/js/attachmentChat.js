function attachmentChat(divId) {
  $(`#attachment-chat-${divId}`).unbind("change").on("change", function () {
    let fileData = $(this).prop("files")[0];
    let limit = 10485763; // byte = 1MB

    if (fileData.size > limit) {
      alertify.notify("Tệp đính kèm kích thước ảnh không phù hợp phải < 1MB", "error", 5);
      $(this).val(null);
      return false;
    }

    let targetId = $(this).data("chat");
    let isChatGroup = false;

    let messageFormData = new FormData();
    messageFormData.append("my-attachment-chat", fileData);
    messageFormData.append("uid", targetId);

    if ($(this).hasClass("chat-in-group")) {
      messageFormData.append("isChatGroup", true);
      isChatGroup = true;
    }

    $.ajax({
      url: "/message/add-new-attachment",
      type: "post",
      cache: false,
      contentType: false,
      processData: false,
      data: messageFormData,
      success: function (data) {
        // console.log(data)
        let dataToEmit = {
          message: data.message
        };
        // xử lí trước khi đẩy ra chat sau khi chat
        let messageOfMe = $(`<div class="bubble me bubble-attachment-file" data-mess-id="${data.message._id}"></div>`);
        let attachmentChat = `<a href="data:${data.message.file.contentType}; base64,${bufferToBase64(data.message.file.data.data)}";
        download="${data.message.file.fileName}">${data.message.file.fileName}</a>`;
        if (isChatGroup) {
          let senderavatar = ` <img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}"/>`;
          messageOfMe.html(`${senderavatar} ${attachmentChat}`)
          increaseMassageInGroup(divId);
          dataToEmit.groupId = targetId;
        } else {
          messageOfMe.html(attachmentChat);

          dataToEmit.contactId = targetId;
        }
        // đẩy ra màn hình
        $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
        nineScrollRight(divId);
        // thay đổi tin nhắn cuối và thời gian cập nhật bên danh sách left
        $(`.person[data-chat=${divId}]`).find("span.time").removeClass("new-message-css").html(moment(data.message.createdAt).locale("vi").startOf("seconds").fromNow());
        $(`.person[data-chat=${divId}]`).find("span.preview").html("Tệp đính kèm...");
        // closest : tìm gần nhất
        // đẩy lên trên cùng đối với tin nhắn mới nhất lại bên left 
        $(`.person[data-chat=${divId}]`).on("tensukien.namespace_nhan", function () {
          let dataToMove = $(this).parent();
          $(this).closest("ul").prepend(dataToMove);
          $(this).off("tensukien.namespace_nhan");
        });
        $(`.person[data-chat=${divId}]`).trigger("tensukien.namespace_nhan");
        // gửi sự kiện lên sever để xử lí realtime
        socket.emit("chat-attachment", dataToEmit);
        // đẩy hình ảnh vào thư viện tệp
        let attachmentToAddModal = `   
        <li>
          <a href="data:${data.message.file.contentType}; base64,${bufferToBase64(data.message.file.data.data)}" download="${data.message.file.fileName}">
          ${data.message.file.fileName}
          </a>  
        </li>`;
        $(`#attachmentsModal_${divId}`).find("ul.list-attachments").append(attachmentToAddModal);
      },
      error: function (error) {
        alertify.notify(error.responseText, "error", 5)
      }
    });
  })
}

$(document).ready(function () {
  socket.on("response-chat-attachment", function (response) {
    let divId = "";
    // xử lí trước khi đẩy ra chat sau khi chat
    let messageOfYou = $(`<div class="bubble you bubble-attachment-file" data-mess-id="${response.message._id}"></div>`);
    let attachmentChat = `<a href="data:${response.message.file.contentType}; base64,${bufferToBase64(response.message.file.data.data)}";
    download="${response.message.file.fileName}">${response.message.file.fileName}</a>`;
    // conver lần nữa khúc này mình chat lên nên khúc cover lúc lôi từ data không xài được
    if (response.currentGroupId) {
      let senderavatar = ` <img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}"/>`;
      messageOfYou.html(`${senderavatar} ${attachmentChat}`)
      divId = response.currentGroupId;

      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        increaseMassageInGroup(divId);
      }
    } else {
      messageOfYou.html(attachmentChat);
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
    $(`.person[data-chat=${divId}]`).find("span.preview").html("Tệp đính kèm...");
    // đẩy lên trên cùng đối với tin nhắn mới nhất lại bên left 
    $(`.person[data-chat=${divId}]`).on("tensukien.namespace_nhan", function () {
      let dataToMove = $(this).parent();
      $(this).closest("ul").prepend(dataToMove);
      $(this).off("tensukien.namespace_nhan");
    });
    $(`.person[data-chat=${divId}]`).trigger("tensukien.namespace_nhan");
    // đẩy hình ảnh vào thư viện ảnh
    if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
      let attachmentToAddModal = `   
    <li>
      <a href="data:${response.message.file.contentType}; base64,${bufferToBase64(response.message.file.data.data)}" download="${response.message.file.fileName}">
      ${response.message.file.fileName}
      </a>  
    </li>`;
      $(`#attachmentsModal_${divId}`).find("ul.list-attachments").append(attachmentToAddModal);
    }
  });
});