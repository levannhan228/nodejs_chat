$(document).ready(function () {
  $("#link-read-more-notif-contacts-receive").bind("click", function () {
    let skipNumber = $("#request-contact-sent").find("li").length;

    $("#link-read-more-notif-contacts-receive").css("display", "none");
    $(".lds-ellipsis-contacts-receive").css("display", "inline-block");

    $.get(`/contact/read-more-contacts-received?skipNumber=${skipNumber}`, function (newContactUsers) {
      if (!newContactUsers.length) {
        alertify.notify("không còn gì để xem", "error", 5);
        $("#link-read-more-notif-contacts-receive").css("display", "inline-block");
        $(".lds-ellipsis-contacts-receive").css("display", "none");
        return false;
      }
      newContactUsers.forEach(function (user) {
        $("#request-contact-sent").
          find("ul").append(`<li class="_contactList" data-uid="${user._id}">
          <div class="contactPanel">
            <div class="user-avatar">
              <img src="images/users/${user.avatart}" alt="">
            </div>
            <div class="user-name">
              <p>
              ${user.username}
              </p>
            </div>
            <br>
            <div class="user-address">
              <span>&nbsp ${(user.address !== null) ? user.address : ""}</span>
            </div>
            <div class="user-approve-request-contact-received" data-uid="${user._id}">
              Chấp nhận
            </div>
            <div class="user-remove-request-contact-received action-danger" data-uid="${user._id}">
              Xóa yêu cầu
            </div>
          </div>
        </li>`);
      });
      removeRequestContactReceived(); //js/removeRequestContactReceived.js
      approveRequestContactReceived(); //js/approveRequestContactReceived.js
      $("#link-read-more-notif-contacts-receive").css("display", "inline-block");
      $(".lds-ellipsis-contacts-receive").css("display", "none");
    });
  });
});