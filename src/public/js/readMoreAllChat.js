$(document).ready(function () {
  $("#link-read-more-all-chat").bind("click", function () {
    let skipPersonal = $("#all-chat").find("li:not(.group-chat)").length;
    let skipGroup = $("#all-chat").find("li.group-chat").length;

    $("#link-read-more-all-chat").css("display", "none");
    $(".lds-ellipsis-contacts-all-chat").css("display", "inline-block");

    $.get(`/message/read-more-all-chat?skipPersonal=${skipPersonal}&skipGroup=${skipGroup}`, function (data) {
      
      if(data.leftSideData.trim() === ""){
        alertify.notify("không còn cuộc hội thoại nào", "error", 5);
        $("#link-read-more-all-chat").css("display", "inline-block");
        $(".lds-ellipsis-contacts-all-chat").css("display", "none");
        return false;
      }

      // render phần leftSide
      $("#all-chat").find("ul").append(data.leftSideData);

      // gọi lại hàm liên quan
      resizeNiceScrollLeftsize();
      nineScrollLeft();
      
      // render phần rightSide
      $("#screen-chat").append(data.rightSideData);

      // gọi lại hàm liên quan
      changeScreenChat();

      // conver emoij -> image 
      useEmoji();

      // render imageModal
      $("body").append(data.imageModalData);

      // gọi function sắp xếp ảnh liên quan
      gridPhotos(5);

      // render attachmentModal
      $("body").append(data.attachmentModalData);

      // check online or off
      socket.emit("check-status");
      // xoa load
      $("#link-read-more-all-chat").css("display", "inline-block");
      $(".lds-ellipsis-contacts-all-chat").css("display", "none");
      // goi lai readmore message
      readMoreMessages();
      // zoom img
      zoomImageChat();
      // $("body").append(data.membersModalData);
      // userTalk();
    });
  });
});