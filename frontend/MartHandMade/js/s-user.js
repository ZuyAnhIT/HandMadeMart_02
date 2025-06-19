document.addEventListener("DOMContentLoaded", function () {
  hienThiThongTinNhanVien();
});

// 🟢 Lấy thông tin cá nhân nhân viên từ API
async function hienThiThongTinNhanVien() {
  try {
    const response = await fetch(
      "http://localhost:5258/api/NhanVien/LayCaNhanNhanVien",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Không thể lấy thông tin nhân viên");

    const data = await response.json();
    if (data) {
      document.getElementById("name").value = data.hoTenNhanVien || "";
      document.getElementById("email").value = data.emailNhanVien || "";
      document.getElementById("phone").value = data.soDienThoaiNhanVien || "";
      document.getElementById("address").value = data.diaChiNhanVien || "";
    }
  } catch (error) {
    console.error("❌ Lỗi khi tải thông tin nhân viên:", error);
    alert("Không thể tải thông tin nhân viên.");
  }
}

// 🟢 Cập nhật thông tin nhân viên
async function capNhatThongTinNhanVien(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append("hoTenNhanVien", document.getElementById("name").value);
  formData.append("emailNhanVien", document.getElementById("email").value);
  formData.append(
    "soDienThoaiNhanVien",
    document.getElementById("phone").value
  );
  formData.append("diaChiNhanVien", document.getElementById("address").value);

  console.log("📤 Dữ liệu FormData gửi đi:", Object.fromEntries(formData));

  try {
    const response = await fetch(
      "http://localhost:5258/api/NhanVien/CapNhatCaNhan",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          // ❌ Không đặt "Content-Type" khi gửi FormData, fetch sẽ tự thêm
        },
        body: formData,
      }
    );

    const result = await response.json();
    console.log("📩 Phản hồi từ server:", result);

    if (!response.ok) throw new Error(result.message || "Cập nhật thất bại");

    alert("✅ Cập nhật thông tin thành công!");
    hienThiThongTinNhanVien();
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật thông tin nhân viên:", error);
    alert("Cập nhật không thành công. Vui lòng thử lại.");
  }
}

// 6.2 Quản lý thông tin khách hàng
document.addEventListener("DOMContentLoaded", function () {
  loadCustomers();
});

// 🟢 Lấy danh sách khách hàng từ API
function loadCustomers() {
  const tableBody = document.querySelector("#customer-info-table tbody");

  if (!tableBody) {
    console.error("❌ Không tìm thấy bảng khách hàng.");
    return;
  }

  fetch("http://localhost:5258/api/KhachHang/LayKhachHang", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Không thể tải danh sách khách hàng");
      return response.json();
    })
    .then((data) => {
      if (data?.data?.$values) {
        renderCustomersTable(data.data.$values);
      } else {
        console.error("❌ Dữ liệu API không đúng định dạng.");
      }
    })
    .catch((error) => {
      console.error("❌ Lỗi khi tải danh sách khách hàng:", error);
      alert("Không thể tải danh sách khách hàng. Vui lòng thử lại sau.");
    });
}

// 🟢 Hiển thị danh sách khách hàng
function renderCustomersTable(customers) {
  const tableBody = document.querySelector("#customer-info-table tbody");
  tableBody.innerHTML = "";

  customers.forEach((customer, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${customer.hoTenKhachHang || "N/A"}</td>
          <td>${customer.soDienThoaiKhach || "N/A"}</td>
          <td>${customer.emailKhach || "N/A"}</td>
          <td>${customer.diaChiKhach || "N/A"}</td>
        `;
    tableBody.appendChild(tr);
  });
}

// ============ 7. AUTHENTICATION AND LOGOUT SECTION ============
// Đăng xuất
function logout() {
  // Hiển thị xác nhận
  if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    return;
  }

  // Xóa token và các dữ liệu lưu trong localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");

  // Chuyển hướng về trang đăng nhập
  window.location.href = "account.html";
}

// ============ UTILITY FUNCTIONS ============
// Hiển thị thông báo
function showNotification(type, message) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Tự động ẩn thông báo sau 3 giây
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
