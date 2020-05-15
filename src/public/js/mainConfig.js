const socket = io();

function nineScrollLeft() {
  $('.left').niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
}

function resizeNiceScrollLeftsize() {
  $('.left').getNiceScroll().resize();
}

function nineScrollRight(divId) {
  $(`.right .chat[data-chat=${divId}]`).niceScroll({
    smoothscroll: true,
    horizrailenabled: false,
    cursorcolor: '#ECECEC',
    cursorwidth: '7px',
    scrollspeed: 50
  });
  $(`.right .chat[data-chat=${divId}]`).scrollTop($(`.right .chat[data-chat=${divId}]`)[0].scrollHeight);
}

function enableEmojioneArea(divId) {
  $(`#write-chat-${divId}`).emojioneArea({
    standalone: false,
    pickerPosition: 'top',
    filtersPosition: 'bottom',
    tones: false,
    autocomplete: false,
    inline: true,
    hidePickerOnBlur: true,
    search: false,
    shortnames: false,
    events: {
      keyup: function (editor, event) {
        // gán giá trị thay đổi vào input bị ẩn
        $(`#write-chat-${divId}`).val(this.getText());
      },
      click: function () {
        // xử lí DOM cho chat văn bản + icon
        textAndEmojiChat(divId);
        // xử lí "có người đang chat"
        typingOn(divId);
      },
      blur: function () {
        // xóa .... ai đó đang chat
        typingOff(divId);
      }
    },
  });
  $('.icon-chat').bind('click', function (event) {
    event.preventDefault();
    $('.emojionearea-button').click();
    $('.emojionearea-editor').focus();
  });
}

function spinLoaded() {
  $('.lds-ripple').css('display', 'none');
}

function spinLoading() {
  $('.lds-ripple').css('display', 'block');
}

function ajaxLoading() {
  $(document)
    .ajaxStart(function () {
      spinLoading();
    })
    .ajaxStop(function () {
      spinLoaded();
    });
}

function showModalContacts() {
  $('#show-modal-contacts').click(function () {
    $(this).find('.noti_contact_counter').fadeOut('slow');
  });
}

function configNotification() {
  $('#noti_Button').click(function () {
    $('#notifications').fadeToggle('fast', 'linear');
    $('.noti_counter').fadeOut('slow');
    return false;
  });
  $(".main-content").click(function () {
    $('#notifications').fadeOut('fast', 'linear');
  });
}

function gridPhotos(layoutNumber) {
  $(".show-images").unbind("click").on("click", function () {
    let href = $(this).attr("href");
    let modalImagesId = href.replace("#", "");

    let originDataImage = $(`#${modalImagesId}`).find("div.modal-body").html();

    let countRows = Math.ceil($(`#${modalImagesId}`).find("div.all-images>img").length / layoutNumber);
    let layoutStr = new Array(countRows).fill(layoutNumber).join("");
    $(`#${modalImagesId}`).find("div.all-images").photosetGrid({
      highresLinks: true,
      rel: "withhearts-gallery",
      gutter: "2px",
      layout: layoutStr,
      onComplete: function () {
        $(`#${modalImagesId}`).find(".all-images").css({
          "visibility": "visible"
        });
        $(`#${modalImagesId}`).find(".all-images a").colorbox({
          photo: true,
          scalePhotos: true,
          maxHeight: "90%",
          maxWidth: "90%"
        });
      }
    });
    // đóng modal
    $(`#${modalImagesId}`).on('hidden.bs.modal', function () {
      $(this).find("div.modal-body").html(originDataImage);
    });
  });
}

function flashMasterNotify() {
  let notify = $(".master-success-message").text();
  if (notify.length) {
    alertify.notify(notify, "success", 5);
  }
}

function changeTypeChat() {
  $("#select-type-chat").bind("change", function () {
    let optionSelected = $("option:selected", this);
    optionSelected.tab("show");

    if ($(this).val() === "user-chat") {
      $(".create-group-chat").hide();
    } else {
      $(".create-group-chat").show();
    }
  })
}

function changeScreenChat() {
  $(".room-chat").unbind("click").on("click", function () {

    let divId = $(this).find("li").data("chat");

    $(".person").removeClass("active");
    $(`.person[data-chat=${divId}]`).addClass("active");
    $(this).tab("show");

    nineScrollRight(divId);

    // Bật emoji, tham số truyền vào là id của box nhập nội dung tin nhắn
    enableEmojioneArea(divId);
    // DOM tin nhắn hình ảnh
    imageChat(divId)
    // DOM tin nhắn tệp đính kèm
    attachmentChat(divId)
    // video chat
    videoChat(divId)
  });
}

function useEmoji() {
  $(".convert-emoji").each(function () {
    var original = $(this).html();
    var converted = emojione.toImage(original);
    $(this).html(converted);
  });
}

function bufferToBase64(buffer) {
  return btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

function notConversations(){
  if(!$("ul.people").find("a").length){
    Swal.fire({
      title: "Bạn chưa có bạn bè? Hãy tìm kiếm bạn bè để trò chuyện",
      type: "info",
      showCancelButton: false,
      confirmButtonText:"Xác nhận",
    }).then((result)=>{
      $("#contactsModal").modal("show");
    });
  }
}

function userTalk(){
  $(".user-talk").unbind("click").on("click",function(){
    let dataChat = $(this).data("uid");
    $("ul.people").find(`a[href="#uid_${dataChat}"]`).click();
    $(this).closest("div.modal").modal("hide");
  });
}

function zoomImageChat(){
  $(".show-image-chat").unbind("click").on("click",function(){
    $("#img-chat-modal").css("display","block");
    $("#img-chat-modal-content").attr("src",$(this)[0].src);
    
    $("#img-chat-modal").on("click",function(){
      $(this).css("display","none");
    });
  })
}
$(document).ready(function () {
  // Hide số thông báo trên đầu icon mở modal contact
  showModalContacts();

  // Bật tắt popup notification
  configNotification();

  // Cấu hình thanh cuộn trái
  nineScrollLeft();
  // Icon loading khi chạy ajax
  ajaxLoading();

  // Hiển thị hình ảnh grid slide trong modal tất cả ảnh, tham số truyền vào là số ảnh được hiển thị trên 1 hàng.
  // Tham số chỉ được phép trong khoảng từ 1 đến 5
  gridPhotos(5);
  // Thông báo ở màn hình
  flashMasterNotify();
  // Chuyển kiểu trò chuyện
  changeTypeChat();
  // Chuyển đoạn hội thoại sang người khác
  changeScreenChat();
  // Dùng thư viện conver icon dạng unicode -> img
  useEmoji();
  //chọn thành viên chat đầu tiên lúc mới vào
  if ($("ul.people").find("a").length) {
    $("ul.people").find("a")[0].click();
  }
  $("#video-chat-group").bind("click", function () {
    alertify.notify("Tính năng này không áp dụng với nhóm trò chuyện", "error", 5)
  });
  // thông báo ban đầu khi không có bạn bè
  notConversations();
  // trò chuyện
  userTalk();
  // zoom img
  zoomImageChat();
});
