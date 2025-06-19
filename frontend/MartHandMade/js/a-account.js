// ============ 2. ACCOUNT MANAGEMENT SECTION ============

// 2.1 Quản lý tài khoản cá nhân
const api = {
  // ✅ 1. LẤY THÔNG TIN TÀI KHOẢN
  getTaiKhoanQuanLy: async () => {
    try {
      const response = await fetch(
        "http://localhost:5258/api/TaiKhoan/LayTaiKhoanQuanLy",
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
      hienThiThongBao(error.message, "error");
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
      hienThiThongBao(error.message, "error");
      return null;
    }
  },
};

// ✅ 3. Hiển thị thông tin tài khoản lên form
async function hienThiThongTinTaiKhoan() {
  const usernameField = document.getElementById("username");
  if (!usernameField)
    return console.error("❌ Lỗi: Không tìm thấy input username!");

  const accountInfo = await api.getTaiKhoanQuanLy();
  if (accountInfo) {
    usernameField.value = accountInfo.tenDangNhap || "";
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

// ✅ 6. Gọi API khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  hienThiThongTinTaiKhoan();
  const form = document.getElementById("personal-account-form");
  if (form) {
    form.addEventListener("submit", capNhatTaiKhoanQuanLy);
  } else {
    console.error("❌ Lỗi: Không tìm thấy form #personal-account-form!");
  }
});

// 2.2 Quản lý tài khoản nhân viên
// 🟢 1. Load danh sách tài khoản nhân viên
function loadStaffAccounts() {
  const loader = document.getElementById("staff-accounts-loader");
  if (loader) loader.classList.remove("hidden");

  fetch("http://localhost:5258/api/TaiKhoan/LayDanhSachTaiKhoanNhanVien", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Không thể tải danh sách nhân viên");
      return response.json();
    })
    .then((data) => {
      if (!data || !data.$values)
        throw new Error("Dữ liệu API không đúng định dạng");

      staffAccounts = data.$values;
      renderStaffAccountsTable();
    })
    .catch((error) => {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
      showNotification("error", "Không thể tải danh sách nhân viên.");
    })
    .finally(() => {
      if (loader) loader.classList.add("hidden");
    });
}

// 🟢 2. Hiển thị danh sách tài khoản nhân viên lên bảng
function renderStaffAccountsTable() {
  const tableBody = document.querySelector("#staff-account-table tbody");
  if (!tableBody) {
    console.error("Không tìm thấy bảng danh sách tài khoản");
    return;
  }

  tableBody.innerHTML = "";

  staffAccounts.forEach((account, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${account.tenNhanVien || "Chưa có tên"}</td>
      <td>${account.tenDangNhap}</td>
      <td>********</td>
      <td>
        <span class="status-badge ${
          account.trangThaiTaiKhoan === "Hoạt động" ? "active" : "inactive"
        }">
          ${account.trangThaiTaiKhoan}
        </span>
      </td>
      <td>
        <button class="action-btn toggle-status" data-id="${
          account.maTaiKhoan
        }">
          ${
            account.trangThaiTaiKhoan === "Hoạt động"
              ? "Dừng hoạt động"
              : "Kích hoạt"
          }
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // 🟢 Gán sự kiện click cho nút thay đổi trạng thái
  document.querySelectorAll(".toggle-status").forEach((button) => {
    button.addEventListener("click", function () {
      const accountId = this.getAttribute("data-id");
      toggleStaffAccountStatus(accountId);
    });
  });
}

// 🟢 3. Cập nhật trạng thái tài khoản nhân viên
function toggleStaffAccountStatus(accountId) {
  const account = staffAccounts.find((acc) => acc.maTaiKhoan === accountId);
  if (!account) return;

  const newStatus =
    account.trangThaiTaiKhoan === "Hoạt động" ? "Không Hoạt động" : "Hoạt động";

  if (
    !confirm(
      `Bạn có chắc muốn ${
        newStatus === "Hoạt động" ? "kích hoạt" : "dừng"
      } tài khoản này?`
    )
  ) {
    return;
  }

  fetch(
    `http://localhost:5258/api/TaiKhoan/capnhattrangthainhanvien/${account.maNhanVien}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok)
        throw new Error("Không thể thay đổi trạng thái tài khoản");
      return response.json();
    })
    .then((data) => {
      showNotification("success", "Thay đổi trạng thái tài khoản thành công");
      account.trangThaiTaiKhoan = data.trangThaiTaiKhoan; // Cập nhật trạng thái mới
      renderStaffAccountsTable();
    })
    .catch((error) => {
      console.error("Lỗi khi thay đổi trạng thái tài khoản:", error);
      showNotification("error", "Không thể thay đổi trạng thái.");
    });
}

// 🟢 4. Gọi hàm khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  loadStaffAccounts();
});

// 🟢 5. Hàm hiển thị thông báo
function showNotification(type, message) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// 🟢 6. Chèn CSS vào trang từ JavaScript
const styles = `
  .status-badge {
    padding: 5px 10px;
    border-radius: 5px;
    font-weight: bold;
    display: inline-block;
  }
  
  .status-badge.active {
    background-color: #28a745;
    color: white;
  }

  .status-badge.inactive {
    background-color: #dc3545;
    color: white;
  }

  .action-btn {
    padding: 5px 10px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    border-radius: 4px;
    transition: background-color 0.3s;
  }

  .action-btn:hover {
    background-color: #007bff;
    color: white;
  }

  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 15px;
    border-radius: 5px;
    font-weight: bold;
    z-index: 1000;
    transition: all 0.3s ease-in-out;
  }

  .notification.success {
    background-color: #28a745;
    color: white;
  }

  .notification.error {
    background-color: #dc3545;
    color: white;
  }

  .hidden {
    display: none;
  }
    /* 🟢 CSS cho Modal */
.modal {
  display: none; /* Ẩn mặc định */
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Mờ nền */
  justify-content: center;
  align-items: center;
}

/* 🟢 Nội dung Modal */
.modal-content {
  background: #fff;
  padding: 20px;
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: fadeIn 0.3s ease-in-out;
}

/* 🟢 Tiêu đề */
.modal-content h2 {
  text-align: center;
  margin-bottom: 15px;
  font-size: 22px;
  color: #333;
}

/* 🟢 Input Form */
.modal-content input,
.modal-content textarea {
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

/* 🟢 Nút Thêm nhân viên */
#add-staff-btn {
  width: 100%;
  background: #28a745;
  color: white;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

#add-staff-btn:hover {
  background: #218838;
}

/* 🟢 Nút Hủy */
.close-modal {
  width: 100%;
  background: #dc3545;
  color: white;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 5px;
  transition: 0.3s;
}

.close-modal:hover {
  background: #c82333;
}

/* 🟢 Hiệu ứng Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

`;

// 🟢 7. Thêm CSS vào <head>
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

/* 🟢 3. Thêm tài khoản nhân viên */
document.addEventListener("DOMContentLoaded", function () {
  /* 🟢 Hiển thị modal thêm tài khoản nhân viên */
  function showAddStaffModal() {
    console.log("🔄 Gọi showAddStaffModal...");

    let modal = document.getElementById("add-staff-modal");

    if (!modal) {
      console.log("⚠️ Modal chưa tồn tại, đang tạo mới...");
      modal = document.createElement("div");
      modal.id = "add-staff-modal";
      modal.classList.add("modal");
      modal.innerHTML = `
        <div class="modal-content">
          <h2>Thêm nhân viên</h2>
          <form id="add-staff-form">
            <input type="text" id="staff-fullname" placeholder="Họ và Tên" required>
            <input type="text" id="staff-username" placeholder="Tên đăng nhập" required>
            <input type="password" id="staff-password" placeholder="Mật khẩu" required>
            <input type="password" id="staff-confirm-password" placeholder="Xác nhận mật khẩu" required>
            <textarea id="staff-address" placeholder="Địa chỉ" required></textarea>
            <input type="email" id="staff-email" placeholder="Email" required>
            <input type="text" id="staff-phone" placeholder="Số điện thoại" required>
            <button type="submit" id="add-staff-btn">Thêm nhân viên</button>
            <button type="button" class="close-modal">Hủy</button>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      // Đóng modal khi bấm "Hủy"
      modal.querySelector(".close-modal").addEventListener("click", () => {
        console.log("❌ Đóng modal");
        modal.style.display = "none";
      });

      // Gán sự kiện submit form (chỉ gán một lần)
      modal
        .querySelector("#add-staff-form")
        .addEventListener("submit", addStaffAccount);
    }

    console.log("✅ Hiển thị modal");
    modal.style.display = "block";
  }

  /* 🟢 Thêm tài khoản nhân viên */
  function addStaffAccount(event) {
    event.preventDefault();
    console.log("📌 Bắt đầu thêm tài khoản...");

    let modal = document.getElementById("add-staff-modal");
    if (!modal) {
      console.error("❌ Modal chưa tồn tại trong DOM");
      return;
    }

    const fullName = modal.querySelector("#staff-fullname")?.value.trim() || "";
    const username = modal.querySelector("#staff-username")?.value.trim() || "";
    const password = modal.querySelector("#staff-password")?.value || "";
    const confirmPassword =
      modal.querySelector("#staff-confirm-password")?.value || "";
    const address = modal.querySelector("#staff-address")?.value.trim() || "";
    const email = modal.querySelector("#staff-email")?.value.trim() || "";
    const phoneNumber = modal.querySelector("#staff-phone")?.value.trim() || "";

    console.log("📌 Dữ liệu nhập vào:", {
      fullName,
      username,
      password,
      confirmPassword,
      address,
      email,
      phoneNumber,
    });

    if (
      !fullName ||
      !username ||
      !password ||
      !confirmPassword ||
      !address ||
      !email ||
      !phoneNumber
    ) {
      showNotification("error", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("error", "Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    // Disable nút & hiển thị loading
    const addStaffBtn = document.getElementById("add-staff-btn");
    addStaffBtn.innerHTML = '<span class="spinner"></span> Đang xử lý...';
    addStaffBtn.disabled = true;

    // Tạo FormData thay vì JSON
    const formData = new FormData();
    formData.append("HoTen", fullName);
    formData.append("TenDangNhap", username);
    formData.append("MatKhau", password);
    formData.append("NhapLaiMatKhau", confirmPassword);
    formData.append("DiaChi", address);
    formData.append("Email", email);
    formData.append("SoDienThoai", phoneNumber);

    console.log("📤 Dữ liệu gửi lên API:", formData);

    // Gửi API
    fetch("http://localhost:5258/api/TaiKhoan/ThemTaiKhoanNhanVien", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Không dùng "Content-Type" vì FormData tự động set
      },
      body: formData,
    })
      .then(async (response) => {
        const responseData = await response.json();
        console.log("📥 Phản hồi từ API:", responseData);

        if (!response.ok) {
          throw new Error(
            responseData.message ||
              "Không thể thêm tài khoản. Vui lòng thử lại."
          );
        }

        return responseData;
      })
      .then(() => {
        showNotification("success", "Thêm tài khoản nhân viên thành công");

        // Đóng modal & reset form
        document.getElementById("add-staff-modal").style.display = "none";
        document.getElementById("add-staff-form").reset();

        // Cập nhật danh sách nhân viên
        loadStaffAccounts();
      })
      .catch((error) => {
        console.error("❌ Lỗi khi thêm tài khoản nhân viên:", error);
        showNotification("error", error.message);
      })
      .finally(() => {
        // Khôi phục nút sau khi hoàn tất
        addStaffBtn.innerHTML = "Thêm nhân viên";
        addStaffBtn.disabled = false;
      });
  }

  /* 🟢 Hàm hiển thị thông báo */
  function showNotification(type, message) {
    alert(`[${type.toUpperCase()}] ${message}`);
  }

  /* 🟢 Gọi modal khi nhấn nút thêm nhân viên */
  const addButton = document.getElementById("open-add-staff-modal");
  if (addButton) {
    addButton.addEventListener("click", () => {
      console.log("✅ Nút Thêm Nhân Viên đã được nhấn");
      showAddStaffModal();
    });
  } else {
    console.error("❌ Không tìm thấy nút 'open-add-staff-modal'");
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  loadCustomerAccounts();
});

// 🟢 1. Tải danh sách tài khoản khách hàng từ API
function loadCustomerAccounts() {
  const loader = document.getElementById("customer-accounts-loader");
  if (loader) loader.classList.remove("hidden");

  fetch(`http://localhost:5258/api/TaiKhoan/LayDanhSachTaiKhoanKhachHang`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok)
        throw new Error("Không thể tải danh sách tài khoản khách hàng");
      return response.json();
    })
    .then((data) => {
      if (!data || !data.$values)
        throw new Error("Dữ liệu API không đúng định dạng");

      customerAccounts = data.$values;
      renderCustomerAccountsTable();
    })
    .catch((error) => {
      console.error("Lỗi khi tải danh sách khách hàng:", error);
      showNotification(
        "error",
        "Không thể tải danh sách khách hàng. Vui lòng thử lại."
      );
    })
    .finally(() => {
      if (loader) loader.classList.add("hidden");
    });
}

// 🟢 2. Hiển thị danh sách khách hàng lên bảng
function renderCustomerAccountsTable() {
  const tableBody = document.querySelector("#customer-account-table tbody");
  if (!tableBody) {
    console.error("Không tìm thấy bảng danh sách tài khoản khách hàng");
    return;
  }

  tableBody.innerHTML = "";

  customerAccounts.forEach((account, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${account.tenKhachHang || "Chưa có tên"}</td>
      <td>${account.tenDangNhap}</td>
      <td>********</td>
      <td>
        <span class="status-badge ${
          account.trangThaiTaiKhoan === "Hoạt động" ? "active" : "inactive"
        }">
          ${account.trangThaiTaiKhoan}
        </span>
      </td>
      <td>
        <button class="action-btn toggle-status" data-id="${
          account.maTaiKhoan
        }">
          ${
            account.trangThaiTaiKhoan === "Hoạt động"
              ? "Dừng hoạt động"
              : "Kích hoạt"
          }
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // 🟢 Gán sự kiện thay đổi trạng thái tài khoản
  document.querySelectorAll(".toggle-status").forEach((button) => {
    button.addEventListener("click", function () {
      const accountId = this.getAttribute("data-id");
      toggleCustomerAccountStatus(accountId);
    });
  });
}

// 🟢 3. Cập nhật trạng thái tài khoản khách hàng
function toggleCustomerAccountStatus(accountId) {
  const account = customerAccounts.find((acc) => acc.maTaiKhoan === accountId);
  if (!account) return;

  const newStatus =
    account.trangThaiTaiKhoan === "Hoạt động" ? "Không Hoạt động" : "Hoạt động";

  if (
    !confirm(
      `Bạn có chắc muốn ${
        newStatus === "Hoạt động" ? "kích hoạt" : "dừng"
      } tài khoản này?`
    )
  ) {
    return;
  }

  fetch(
    `http://localhost:5258/api/TaiKhoan/capnhattrangthaikhachhang/${account.maKhachHang}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Lỗi API: ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      showNotification("success", "Thay đổi trạng thái tài khoản thành công");
      account.trangThaiTaiKhoan = data.trangThaiTaiKhoan;
      renderCustomerAccountsTable();
    })
    .catch((error) => {
      console.error("Lỗi khi thay đổi trạng thái tài khoản:", error);
      showNotification("error", error.message);
    });
}

// 🟢 4. Gọi hàm khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  loadCustomerAccounts();
});

// 🟢 5. Hàm hiển thị thông báo
function showNotification(type, message) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
