document.addEventListener("DOMContentLoaded", function () {
  // Xử lý chuyển đổi tab đăng nhập/đăng ký
  const authTabs = document.querySelectorAll(".auth-tab");
  const authForms = document.querySelectorAll(".auth-form");

  authTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      authTabs.forEach((t) => t.classList.remove("active"));
      authForms.forEach((f) => f.classList.remove("active"));
      this.classList.add("active");

      const tabName = this.getAttribute("data-tab");
      document.getElementById(`${tabName}-form`).classList.add("active");
    });
  });

  // Xử lý form đăng nhập
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("login-name").value.trim();
      const password = document.getElementById("login-password").value.trim();

      if (!name || !password) {
        alert("Vui lòng nhập đầy đủ thông tin đăng nhập!");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("TenDangNhap", name);
        formData.append("MatKhau", password);

        const response = await fetch(
          "http://localhost:5258/api/taiKhoan/dangNhap",
          {
            method: "POST",
            body: formData,
          }
        );

        const text = await response.text();
        console.log("📌 Phản hồi từ API:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error("❌ Lỗi parse JSON:", jsonError);
          alert("Phản hồi không hợp lệ từ máy chủ. Vui lòng thử lại.");
          return;
        }

        // ✅ Nếu phản hồi không thành công từ API (ví dụ 401, 403, 500,...)
        if (!response.ok) {
          alert(data.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
          return;
        }

        // ✅ Kiểm tra trạng thái tài khoản
        if (!data.trangThai || data.trangThai.toLowerCase() !== "hoạt động") {
          alert("Tài khoản đã bị dừng hoạt động và không được phép truy cập.");
          return;
        }

        // ✅ Lưu thông tin đăng nhập
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userRole", data.vaiTro);
        localStorage.setItem("trangThai", data.trangThai);

        // ✅ Chuyển hướng theo vai trò
        if (data.vaiTro === "KhachHang") {
          alert(
            "Đăng nhập thành công! Chào mừng bạn đến với tài khoản khách hàng."
          );
          setTimeout(() => {
            window.location.href = "/my-account.html";
          }, 1000);
        } else if (data.vaiTro === "NhanVien") {
          alert("Đăng nhập thành công! Bạn đã vào hệ thống nhân viên.");
          setTimeout(() => {
            window.location.href = "/staff.html";
          }, 1000);
        } else if (data.vaiTro === "QuanLy") {
          alert("Đăng nhập thành công! Chào mừng bạn đến với trang quản lý.");
          setTimeout(() => {
            window.location.href = "/admin.html";
          }, 1000);
        } else {
          alert("Lỗi xác thực! Không xác định được vai trò.");
        }
      } catch (error) {
        console.error("❌ Lỗi kết nối hoặc logic:", error);
        alert("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
      }
    });
  }

  // Dang ky
  document
    .getElementById("register-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const fullName = document.getElementById("register-name").value.trim();
      const email = document.getElementById("register-email").value.trim();
      const phone = document.getElementById("register-phone").value.trim();
      const address = document.getElementById("register-address").value.trim();
      const username = document
        .getElementById("register-username")
        .value.trim();
      const password = document
        .getElementById("register-password")
        .value.trim();
      const confirmPassword = document
        .getElementById("register-confirm-password")
        .value.trim();

      console.log("Dữ liệu gửi lên API:", {
        fullName,
        email,
        phone,
        address,
        username,
        password,
        confirmPassword,
      });

      if (
        !fullName ||
        !email ||
        !phone ||
        !address ||
        !username ||
        !password ||
        !confirmPassword
      ) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      const formData = new FormData();
      formData.append("HoTen", fullName);
      formData.append("Email", email);
      formData.append("SoDienThoai", phone);
      formData.append("DiaChi", address);
      formData.append("TenDangNhap", username);
      formData.append("MatKhau", password);
      formData.append("NhapLaiMatKhau", confirmPassword);

      try {
        const response = await fetch(
          "http://localhost:5258/api/taiKhoan/dangKy",
          {
            method: "POST",
            body: formData,
          }
        );

        console.log("Phản hồi từ server:", response);

        const result = await response.text(); // Kiểm tra API trả về text hay JSON
        console.log("Kết quả API:", result);

        if (!response.ok) {
          throw new Error(result);
        }

        alert("Đăng ký thành công! Chuyển hướng đến trang đăng nhập...");
        setTimeout(() => {
          window.location.href = "account.html";
        }, 1000);
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu đăng ký:", error);
        alert("Thông tin đăng ký đã tồn tại, vui lòng thử lại!");
      }
    });
});
