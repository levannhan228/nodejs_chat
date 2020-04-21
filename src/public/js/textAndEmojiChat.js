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
      if($(`#write-chat-${divId}`).hasClass("chat-in-group")){
        dataTextEmojiForSend.isChatGroup = true;
      }
      //gửi message
      $.post("/message/add-new-text-emoji",dataTextEmojiForSend,function(data){
        // xử lí trước khi đẩy ra chat sau khi chat
        let messageOfMe = $(`<div class="bubble me" data-mess-id="${data.message._id}"></div>`);
        if(dataTextEmojiForSend.isChatGroup){
          messageOfMe.html(` <img src="/images/users/${data.message.sender.avatar}" class="avatar-small" title="${data.message.sender.name}">`);
          messageOfMe.text(data.message.text);
          increaseMassageInGroup(divId);
        }else{
          messageOfMe.text(data.message.text);
        }

        // conver lần nữa khúc này mình chat lên nên khúc cover lúc lôi từ data không xài được
        let converEmojiMessage = emojione.toImage(messageOfMe.html());
        messageOfMe.html(converEmojiMessage)
        // đẩy ra màn hình
        $(`.right .chat[data-chat=${divId}]`).append(messageOfMe);
        nineScrollRight(divId);
        // xóa sau khi chat xóa input của emojionearea mặc định không cần xóa thằng hide
        $(`#write-chat-${divId}`).val("");
        currentEmoijoneArea.find(".emojionearea-editor").text("");
        // thay đổi tin nhắn cuối và thời gian cập nhật bên danh sách left
        $(`.person[data-chat=${divId}]`).find("span.time").html(moment(data.message.createdAt).locale("vi").startOf("seconds").fromNow());
        $(`.person[data-chat=${divId}]`).find("span.preview").html(emojione.toImage(data.message.text));
        // closest : tìm gần nhất
        // đẩy lên trên cùng đối với tin nhắn mới nhất lại bên left 
        $(`.person[data-chat=${divId}]`).on("click.moveConversationToTheTop", function(){
          let dataToMove = $(this).parent();
          $(this).closest("ul").prepend(dataToMove);
          $(this).off("click.moveConversationToTheTop");
        });
        $(`.person[data-chat=${divId}]`).click();
      }).fail(function(response){
        alertify.notify(response.responseText, "error", 5)
      });
    }
  });
}