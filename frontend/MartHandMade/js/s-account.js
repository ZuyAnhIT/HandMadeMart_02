// Đảm bảo khai báo đối tượng api
const api = {
  // ✅ 1. LẤY THÔNG TIN TÀI KHOẢN
  getTaiKhoanQuanLy: async () => {
    try {
      const response = await fetch(
        "http://localhost:5258/api/TaiKhoan/LayTaiKhoanNhanVien",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Không thể lấy thông tin tài khoản");
      return await response.json();
    } catch (error) {
      console.error(error.message); // Hiển thị lỗi trong console
      return null;
    }
  },

  // ✅ 2. CẬP NHẬT TÀI KHOẢN & ĐỔI MẬT KHẨU
  updateTaiKhoanQuanLy: async (accountData) => {
    try {
      const formData = new FormData();
      formData.append("TenDangNhap", accountData.TenDangNhap);
      formData.append("MatKhauCu", accountData.MatKhauCu);
      formData.append("MatKhau", accountData.MatKhau);
      formData.append("NhapLaiMatKhau", accountData.NhapLaiMatKhau);

      const response = await fetch(
        "http://localhost:5258/api/TaiKhoan/CapNhatTaiKhoan",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.Message || "Cập nhật tài khoản thất bại");
      }

      return responseData;
    } catch (error) {
      console.error(error.message); // Hiển thị lỗi trong console
      return null;
    }
  },
};

// ✅ 3. Hiển thị thông tin tài khoản lên form
async function hienThiThongTinTaiKhoan() {
  const usernameField = document.getElementById("username");
  if (!usernameField)
    return console.error("❌ Lỗi: Không tìm thấy input username!");

  const accountInfo = await api.getTaiKhoanQuanLy(); // Lấy thông tin tài khoản
  if (accountInfo) {
    usernameField.value = accountInfo.tenDangNhap || "";
  } else {
    console.error("❌ Lỗi: Không thể lấy thông tin tài khoản");
  }
}

// ✅ 4. Cập nhật tài khoản & đổi mật khẩu
async function capNhatTaiKhoanQuanLy(event) {
  event.preventDefault(); // Ngăn form load lại trang

  const username = document.getElementById("username")?.value;
  const currentPassword = document.getElementById("current-password")?.value;
  const newPassword = document.getElementById("new-password")?.value;
  const confirmPassword = document.getElementById("confirm-password")?.value;

  if (!username || !currentPassword || !newPassword || !confirmPassword) {
    hienThiThongBao("⚠ Vui lòng nhập đầy đủ thông tin!", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    hienThiThongBao("⚠ Mật khẩu mới nhập lại không khớp!", "error");
    return;
  }

  // ✅ Hiển thị trạng thái xử lý
  const submitBtn = document.querySelector(".submit-btn");
  if (submitBtn) {
    submitBtn.innerHTML = '<span class="spinner"></span> Đang xử lý...';
    submitBtn.disabled = true;
  }

  // ✅ Gửi dữ liệu lên API
  const updatedAccount = {
    TenDangNhap: username,
    MatKhauCu: currentPassword,
    MatKhau: newPassword,
    NhapLaiMatKhau: confirmPassword,
  };

  const result = await api.updateTaiKhoanQuanLy(updatedAccount);

  if (result) {
    hienThiThongBao("✅ Cập nhật tài khoản thành công!", "success");
    hienThiThongTinTaiKhoan(); // Cập nhật lại giao diện
  }

  // ✅ Khôi phục nút
  if (submitBtn) {
    submitBtn.innerHTML = "Đổi mật khẩu";
    submitBtn.disabled = false;
  }
}

// ✅ 5. Hiển thị thông báo trên giao diện (CSS trong JS)
function hienThiThongBao(message, type = "success") {
  let notificationBox = document.getElementById("notification-box");

  if (!notificationBox) {
    notificationBox = document.createElement("div");
    notificationBox.id = "notification-box";
    document.body.appendChild(notificationBox);

    // Thêm CSS vào trang
    const style = document.createElement("style");
    style.innerHTML = ` 
              #notification-box {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
              }
              .notification {
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 10px;
              }
              .success {
                background-color: #4caf50;
                color: white;
              }
              .error {
                background-color: #f44336;
                color: white;
              }
            `;
    document.head.appendChild(style);
  }

  // Thêm thông báo mới
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  notificationBox.appendChild(notification);

  // Ẩn thông báo sau 3 giây
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ✅ 6. Xử lý sự kiện khi nhấn vào "Quản lý tài khoản cá nhân"
document.addEventListener("DOMContentLoaded", () => {
  const accountLink = document.querySelector(
    "[data-page='account-management']"
  );
  if (accountLink) {
    accountLink.addEventListener("click", () => {
      // Ẩn tất cả các trang
      const allPages = document.querySelectorAll(".page");
      allPages.forEach((page) => page.classList.add("hidden"));

      // Hiển thị trang "Quản lý tài khoản cá nhân"
      const personalAccountPage = document.getElementById(
        "personal-account-page"
      );
      if (personalAccountPage) {
        personalAccountPage.classList.remove("hidden");
        hienThiThongTinTaiKhoan(); // Hiển thị thông tin tài khoản
      }
    });
  }

  const form = document.getElementById("personal-account-form");
  if (form) {
    form.addEventListener("submit", capNhatTaiKhoanQuanLy);
  } else {
    console.error("❌ Lỗi: Không tìm thấy form #personal-account-form!");
  }
});
