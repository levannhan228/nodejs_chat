function textAndEmojiChat(divId) {
  $(".emojionearea").unbind("keyup").on("keyup", function (element) {
    let currentEmoijoneArea = $(this);
    if (element.which === 13) {
      let targetId = $(`#write-chat-${divId}`).data("chat");
      let messageVal = $(`#write-chat-${divId}`).val();
      if (!targetId.length || !messageVal.length) {
        return false;
      }

      let dataTextEmojiForSend = {
        uid: targetId,
        messageVal: messageVal
      };
      if ($(`#write-chat-${divId}`).hasClass("chat-in-group")) {
        dataTextEmojiForSend.isChatGroup = true;
      }
      //gửi message
      $.post("/message/add-new-text-emoji", dataTextEmojiForSend, function (data) {
        let dataToEmit = {
          message: data.message
        };
        // xử lí trước khi đẩy ra chat sau khi chat
        let messageOfMe = $(`<div class="bubble me" data-mess-id="${data.message._id}"></div>`);
        messageOfMe.text(data.message.text);
        // conver lần nữa khúc này mình chat lên nên khúc cover lúc lôi từ data không xài được
        let converEmojiMessage = emojione.toImage(messageOfMe.html());
        if (dataTextEmojiForSend.isChatGroup) {
          let senderavatar = ` <img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}"/>`;
          messageOfMe.html(`${senderavatar} ${converEmojiMessage}`)
          increaseMassageInGroup(divId);
          dataToEmit.groupId = targetId;
        } else {
          messageOfMe.html(converEmojiMessage);
          dataToEmit.contactId = targetId;
        }

        // đẩy ra màn hình
        $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
        nineScrollRight(divId);
        // xóa sau khi chat xóa input của emojionearea mặc định không cần xóa thằng hide
        $(`#write-chat-${divId}`).val("");
        currentEmoijoneArea.find(".emojionearea-editor").text("");
        // thay đổi tin nhắn cuối và thời gian cập nhật bên danh sách left
        $(`.person[data-chat=${divId}]`).find("span.time").removeClass("new-message-css").html(moment(data.message.createdAt).locale("vi").startOf("seconds").fromNow());
        $(`.person[data-chat=${divId}]`).find("span.preview").html(emojione.toImage(data.message.text));
        // closest : tìm gần nhất
        // đẩy lên trên cùng đối với tin nhắn mới nhất lại bên left 
        $(`.person[data-chat=${divId}]`).on("tensukien.namespace_nhan", function () {
          let dataToMove = $(this).parent();
          $(this).closest("ul").prepend(dataToMove);
          $(this).off("tensukien.namespace_nhan");
        });
        $(`.person[data-chat=${divId}]`).trigger("tensukien.namespace_nhan");
        // gửi sự kiện lên sever để xử lí realtime
        socket.emit("chat-text-emoji", dataToEmit);
        // typingOff
        typingOff(divId);
        // trường hợp hơi đặc biệt (ít khi xảy ra)
        let checkTyping = $(`.chat[data-chat=${divId}]`).find("div.bubble-typing-gif");
        if (checkTyping.length) {
          checkTyping.remove()
        }
      }).fail(function (response) {
        alertify.notify(response.responseText, "error", 5)
      });
    }
  });
}

$(document).ready(function () {
  socket.on("response-chat-text-emoji", function (response) {
    let divId = "";
    // xử lí trước khi đẩy ra chat sau khi chat
    let messageOfYou = $(`<div class="bubble you" data-mess-id="${response.message._id}"></div>`);
    messageOfYou.text(response.message.text);
    // conver lần nữa khúc này mình chat lên nên khúc cover lúc lôi từ data không xài được
    let converEmojiMessage = emojione.toImage(messageOfYou.html());
    if (response.currentGroupId) {
      let senderavatar = ` <img src="/images/users/${response.message.sender.avatar}" class="avatar-small" title="${response.message.sender.name}"/>`;
      messageOfYou.html(`${senderavatar} ${converEmojiMessage}`)
      divId = response.currentGroupId;

      if (response.currentUserId !== $("#dropdown-navbar-user").data("uid")) {
        increaseMassageInGroup(divId);
      }
    } else {
      messageOfYou.html(converEmojiMessage);
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
    $(`.person[data-chat=${divId}]`).find("span.preview").html(emojione.toImage(response.message.text));
    // đẩy lên trên cùng đối với tin nhắn mới nhất lại bên left 
    $(`.person[data-chat=${divId}]`).on("tensukien.namespace_nhan", function () {
      let dataToMove = $(this).parent();
      $(this).closest("ul").prepend(dataToMove);
      $(this).off("tensukien.namespace_nhan");
    });
    $(`.person[data-chat=${divId}]`).trigger("tensukien.namespace_nhan");
  });
});