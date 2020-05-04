function addFriendsToGroup() {
  $("ul#group-chat-friends").find("div.add-user").bind("click", function () {
    let uid = $(this).data("uid");
    $(this).remove();
    let html = $("ul#group-chat-friends").find("div[data-uid=" + uid + "]").html();

    let promise = new Promise(function (resolve, reject) {
      $("ul#friends-added").append(html);
      $("#groupChatModal .list-user-added").show();
      resolve(true);
    });
    promise.then(function (success) {
      $("ul#group-chat-friends").find("div[data-uid=" + uid + "]").remove();
    });
  });
}

function cancelCreateGroup() {
  $("#btn-cancel-group-chat").bind("click", function () {
    $("#groupChatModal .list-user-added").hide();
    $("#input-name-group-chat").val("");
    if ($("ul#friends-added>li").length) {
      $("ul#friends-added>li").each(function (index) {
        $(this).remove();
      });
    }
  }
  );
}

function callSearchFriends(element) {
  if (element.which === 13 || element.type === "click") {
    let keyword = $("#input-search-friends-to-add-group-chat").val();
    let regexKeyword = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/);

    if (!keyword.length) {
      alertify.notify("Chưa nhập nội dung tìm kiếm", "error", 5);
      return false;
    }

    if (!regexKeyword.test(keyword)) {
      alertify.notify("Không được phép chứa kí tự đặc biệt", "error", 5);
      return false;
    }

    $.get(`/contact/search-friends/${keyword}`, function (data) {
      $("ul#group-chat-friends").html(data);
      // Thêm người dùng vào danh sách liệt kê trước khi tạo nhóm trò chuyện
      addFriendsToGroup();
      // Hủy việc tạo nhóm trò chuyện
      cancelCreateGroup();
    });
  }
};

function callCreateGroupChat() {
  $("#btn-create-group-chat").unbind("click").on("click", function () {
    let countUsers = $("ul#friends-added").find("li");
    if (countUsers.length < 2) {
      alertify.notify("Một nhóm trò chuyện cần phải có tối thiểu 2 người trở lên", "error", 5);
      return false;
    }

    let groupChatName = $("#input-name-group-chat").val();
    let regexGroupChatName = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/);
    if (!regexGroupChatName.test(groupChatName) ||groupChatName.length < 2 || groupChatName.length > 40) {
      alertify.notify("Tên nhóm giới hạn từ 2-40 ký tự và không chứa các kí tự đặc biệt", "error", 5);
      return false;
    }

    let arrayIds = [];
    $("ul#friends-added").find("li").each(function (index, item) {
      arrayIds.push({ "userId": $(item).data("uid") });
    });

    Swal.fire({
      title: `Đồng ý tạo nhóm ${groupChatName} ?`,
      text: `nhóm khởi tạo gồm ${arrayIds.length + 1} thành viên !`,
      type: "info",
      showCancelButton: true,
      confirmButtonColor: "#2ECC71",
      cancelButtonColor: "#ff7675",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy"
    }).then((result) => {
      if (!result.value) {
        return false
      }
      $.post("/group-chat/add-new", {
        arrayIds: arrayIds,
        groupChatName: groupChatName
      }, function (data) {
        console.log(data.groupChat)
      }).fail(function (response) {
        alertify.notify(response.responseText, "error", 5)
      });
    });
  });
};

$(document).ready(function () {
  $("#input-search-friends-to-add-group-chat").bind("keypress", callSearchFriends);
  $("#btn-search-friends-to-add-group-chat").bind("click", callSearchFriends);
  callCreateGroupChat();
});