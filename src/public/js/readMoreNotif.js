$(document).ready(function () {
  $("#link-read-more-notif").bind("click", function () {
    let skipNumber = $(".list-notifications").find("li").length;

    $("#link-read-more-notif").css("display", "none");
    $(".lds-ellipsis").css("display", "inline-block");

    $.get(`/notification/read-more?skipNumber=${skipNumber}`, function (notifcations) {
      if (!notifcations.length) {
        alertify.notify("không còn thông báo", "error", 7);
        $("#link-read-more-notif").css("display", "inline-block");
        $(".lds-ellipsis").css("display", "none");
        return false;
      }
      notifcations.forEach(function (notification) {
        $("ul.list-notifications").append(`<li>${notification}</li>`);
      });
      
      $("#link-read-more-notif").css("display", "inline-block");
      $(".lds-ellipsis").css("display", "none");
    });
  });
});