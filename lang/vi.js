export const transValidation = {
  email_incorrect: "Email phải có dạng example@vanhnhan.com",
  gender_incorrect: "không nên chỉnh sửa code",
  password_incorrect: "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt",
  password_confirmation_incorrect: "Nhập lại mật khẩu chưa chính xác",
  update_username: "Username trong khoảng từ 2-18 kí tự và không được phép chứa kí tự đặc biệt",
  update_gender: "Chắc có lỗi gì đó",
  update_address: "Địa chỉ không quá 40 kí tự",
  update_phone: "Số điện thoại không đúng",
};

export const transErrors = {
  account_in_use: "Email này đã được sử dụng.",
  account_removed: "Tài khoản này đã bị xóa khỏi hệ thống, vui long liên hệ để biết thêm chi tiết",
  account_not_active: "Email này đã được đăng ký nhưng chưa kích hoạt",
  account_undefined: "Tài khoản không tồn tại",
  token_undefined: "link kích hoạt đã hết hạn",
  login_failed: "Sai tài khoản hoặc mật khẩu!",
  server_error: "Error, Chắc có vấn đề gì đó",
  avatar_type: "Định dạng không phù hợp, vui lòng chọn file jpg & png.",
  avatar_size: "Kích thước ảnh không phù hợp phải < 1MB",
  user_current_password_failed: "Kiểm tra lại mật khẩu hiện tại"
};

export const transSuccess = {
  userCreated: (userEmail) => {
    return `Tài khoản <strong>${userEmail}</strong> đã tạo thành công, vui lòng vào email để kích hoạt tài khoản`;
  },
  account_active: "Kích hoạt tài khoản thành công",
  loginSuccess: (username) => {
    return `Xin chào ${username}, bạn đến với connect chat`
  },
  logout_success: "Tài khoản đã được đăng xuất",
  user_info_updated: "Cập nhật thông tin người dùng thành công",
  user_password_updated: "Cập nhật mật khẩu thành công"
};

export const transMail = {
  subject: "Xác nhận kích hoạt tài khoản",
  template: (linkVerify) => {
    return `
      <h2>Email xác nhận tài khoản từ connect chat.</h2>
      <h3>Click link bên dưới để xác nhận tài khoản.</h3>
      <h3><a href="${linkVerify}" target="blank">${linkVerify}</a></h3>
    `;
  },
  send_failed: "Có lỗi trong quá trình gửi email"
};
