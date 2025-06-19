//////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
  loadStaffMembers();
});

// 🟢 Lấy danh sách nhân viên từ API
function loadStaffMembers() {
  fetch("http://localhost:5258/api/NhanVien/LayNhanVien", {
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
      if (data?.data?.$values) {
        renderStaffTable(data.data.$values);
      }
    })
    .catch((error) => {
      console.error("❌ Lỗi khi tải danh sách nhân viên:", error);
      alert("Không thể tải danh sách nhân viên.");
    });
}

// 🟢 Hiển thị danh sách nhân viên
function renderStaffTable(staffMembers) {
  const tableBody = document.querySelector("#staff-table tbody");
  tableBody.innerHTML = "";

  staffMembers.forEach((staff, index) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", staff.maNhanVien);

    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${staff.hoTenNhanVien}</td>
        <td>${staff.soDienThoaiNhanVien}</td>
        <td>${staff.emailNhanVien}</td>
        <td>${staff.diaChiNhanVien}</td>
        <td>
          <button class="edit-btn" data-id="${staff.maNhanVien}">Sửa</button>
        </td>
      `;

    tableBody.appendChild(tr);
  });

  // Thêm sự kiện click cho nút "Sửa"
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      openEditStaffRow(this.getAttribute("data-id"));
    });
  });
}

// 🟢 Chỉnh sửa thông tin nhân viên ngay trên bảng
function openEditStaffRow(staffId) {
  const row = document.querySelector(`tr[data-id="${staffId}"]`);
  if (!row) return;

  const cells = row.children;
  const oldValues = {
    name: cells[1].textContent,
    phone: cells[2].textContent,
    email: cells[3].textContent,
    address: cells[4].textContent,
  };

  // Chuyển thành ô nhập
  cells[1].innerHTML = `<input type="text" value="${oldValues.name}" class="edit-input">`;
  cells[2].innerHTML = `<input type="text" value="${oldValues.phone}" class="edit-input">`;
  cells[3].innerHTML = `<input type="email" value="${oldValues.email}" class="edit-input">`;
  cells[4].innerHTML = `<input type="text" value="${oldValues.address}" class="edit-input">`;

  // Thay nút "Sửa" thành "Lưu" và "Hủy"
  cells[5].innerHTML = `
      <button class="save-edit" data-id="${staffId}">Lưu</button>
      <button class="cancel-edit">Hủy</button>
    `;

  // Sự kiện "Lưu"
  row.querySelector(".save-edit").addEventListener("click", function () {
    updateStaff(
      staffId,
      row.querySelector("td:nth-child(2) input").value.trim(),
      row.querySelector("td:nth-child(3) input").value.trim(),
      row.querySelector("td:nth-child(4) input").value.trim(),
      row.querySelector("td:nth-child(5) input").value.trim()
    );
  });

  // Sự kiện "Hủy"
  row.querySelector(".cancel-edit").addEventListener("click", function () {
    loadStaffMembers();
  });
}

// 🟢 Gọi API cập nhật nhân viên
function updateStaff(staffId, newName, newPhone, newEmail, newAddress) {
  if (!newName || !newPhone || !newEmail || !newAddress) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const formData = new FormData();
  formData.append("HoTenNhanVien", newName);
  formData.append("SoDienThoaiNhanVien", newPhone);
  formData.append("EmailNhanVien", newEmail);
  formData.append("DiaChiNhanVien", newAddress);

  fetch(`http://localhost:5258/api/NhanVien/CapNhat/${staffId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      alert("Cập nhật thông tin thành công!");
      loadStaffMembers();
    })
    .catch((error) => {
      console.error("❌ Lỗi khi cập nhật nhân viên:", error);
      alert("Không thể cập nhật nhân viên.");
    });
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
