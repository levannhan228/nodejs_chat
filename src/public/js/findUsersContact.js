function callFindUsers(element) {
  if (element.which === 13 || element.type === "click") {
    let keyword = $("#input-find-users-contact").val();
    let regexKeyword = new RegExp(/^[\s0-9a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/);
    
    if(!keyword.length){
      alertify.notify("Chưa nhập nội dung tìm kiếm", "error", 5);
      return false;
    }

    if(!regexKeyword.test(keyword)){
      alertify.notify("Không được phép chứa kí tự đặc biệt", "error", 5);
      return false;
    }

    $.get(`/contact/find-users/${keyword}`, function(data){
      $("#find-user ul").html(data);
      addContact(); // sau khi tìm kiếm thành công chạy ajax addContact
      removeRequestContactSent();
    });
  }
}

$(document).ready(function () {
  $("#input-find-users-contact").bind("keypress", callFindUsers);
  $("#btn-find-users-contact").bind("click", callFindUsers);
});