function readMoreMessages() {
  $(".right .chat").unbind("scroll").on("scroll", function () {

    // lấy tin nhắn trên cùng
    let firstMessage = $(this).find(".bubble:first");
    // vị trí hiện tại - vị trí trên cùng
    let currentOffSet = firstMessage.offset().top - $(this).scrollTop(); //offset hàm jqery lấy tọa độ 
    if ($(this).scrollTop() === 0) {
      let messageLoading = `<img src="images/chat/message-loading.gif" class="message-loading"/>`;
      $(this).prepend(messageLoading);

      let targetId = $(this).data("chat");
      let skipMessage = $(this).find("div.bubble").length;
      let chatInGroup = $(this).hasClass("chat-in-group") ? true : false;

      let thisDom = $(this);
      $.get(`/message/read-more?skipMessage=${skipMessage}&targetId=${targetId}&chatInGroup=${chatInGroup}`, function (data) {
        if (data.rightSideData.trim() === "") {
          alertify.notify("không còn tin nhắn nào trong cuộc hội thoại", "error", 5);
          thisDom.find("img.message-loading").remove()
          return false;
        }
        // đẩy ra màn hình message
        $(`.right .chat[data-chat=${targetId}]`).prepend(data.rightSideData);
        //
        $(`.right .chat[data-chat=${targetId}]`).scrollTop(firstMessage.offset().top - currentOffSet);
        // conver emoij
        useEmoji();
        // đẩy vào thư viện hình ảnh (imageModalData)
        $(`#imageModal_${targetId}`).find("div.all-images").append(data.imageModalData);
        // gọi lại function sắp xếp ảnh
        gridPhotos();
        // đẩy vào thư viện tệp tin (attachmentsModal)
        $(`attachmentsModal_${targetId}`).find("ul.list-attachments").append(data.attachmentModalData);
        // xóa loading
        thisDom.find("img.message-loading").remove();
      });
    }
  });
}

$(document).ready(function () {
  readMoreMessages();
});