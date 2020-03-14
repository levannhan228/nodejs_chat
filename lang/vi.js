export const transValidation = {
  email_incorrect: "Email phải có dạng example@vanhnhan.com",
  gender_incorrect: "không nên chỉnh sửa code",
  password_incorrect: "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt",
  password_confirmation_incorrect: "Nhập lại mật khẩu chưa chính xác",
};

export const transErrors={
  account_in_use:"Email này đã được sử dụng.",
  account_removed:"Tài khoản này đã bị xóa khỏi hệ thống, vui long liên hệ để biết thêm chi tiết",
  account_not_active:"Email này đã được đăng ký nhưng chưa kích hoạt",
};

export const transSuccess={
  userCreated:(userEmail)=>{
    return `Tài khoản <strong>${userEmail}</strong> đã tạo thành công, vui lòng vào email để kích hoạt tài khoản`;
  }
};
