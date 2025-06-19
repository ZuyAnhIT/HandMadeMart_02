document.addEventListener("DOMContentLoaded", () => {
  setupSidebarNavigation(); // Xử lý Sidebar
  setupLogout(); // Xử lý Đăng Xuất
  hienThiThongTinKhachHang(); // Hiển thị Thông tin Khách Hàng
  hienThiThongTinTaiKhoan(); // Hiển thị Thông tin Tài Khoản

  // Gán sự kiện submit form
  document
    .getElementById("personal-info-form")
    .addEventListener("submit", capNhatThongTinKhachHang);
  document
    .getElementById("account-info-form")
    .addEventListener("submit", capNhatTaiKhoanKhachHang);
});

/* XỬ LÝ GIAO DIỆN (SIDEBAR & ĐĂNG XUẤT)*/
// Xử lý điều hướng sidebar
function setupSidebarNavigation() {
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  const sections = document.querySelectorAll(".section");

  sidebarItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedSection = item.getAttribute("data-section");

      // Ẩn tất cả nội dung
      sections.forEach((section) => section.classList.add("hidden"));

      // Loại bỏ class "active" khỏi tất cả sidebar items
      sidebarItems.forEach((sidebarItem) =>
        sidebarItem.classList.remove("active")
      );

      // Hiển thị nội dung được chọn & Đánh dấu mục active
      document.getElementById(selectedSection).classList.remove("hidden");
      item.classList.add("active");

      // Nếu chọn "ĐĂNG XUẤT", gọi hàm đăng xuất
      if (selectedSection === "logout") {
        setupLogout();
      }
    });
  });
}

// Xử lý đăng xuất
function setupLogout() {
  document.getElementById("confirm-logout").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    showNotification("Bạn đã đăng xuất thành công!", "success");
    setTimeout(() => {
      window.location.href = "/account.html"; // Chuyển hướng về trang đăng nhập
    }, 1000);
  });
}

/*  GỌI API  */
const api = {
  //  LẤY THÔNG TIN KHÁCH HÀNG
  getCaNhanKhachHang: async () => {
    try {
      const response = await fetch(
        "http://localhost:5258/api/KhachHang/LayCaNhanKhachHang",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Không thể lấy thông tin cá nhân");
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy thông tin cá nhân:", error);
      showNotification(error.message, "error");
      return null;
    }
  },

  //  CẬP NHẬT THÔNG TIN KHÁCH HÀNG
  updateCaNhanKhachHang: async (userData) => {
    try {
      const formData = new FormData();
      formData.append("HoTenKhachHang", userData.hoTenKhachHang);
      formData.append("DiaChiKhach", userData.diaChiKhach);
      formData.append("EmailKhach", userData.emailKhach);
      formData.append("SoDienThoaiKhach", userData.soDienThoaiKhach);

      const response = await fetch(
        "http://localhost:5258/api/KhachHang/CapNhat",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Cập nhật thông tin không thành công");
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin cá nhân:", error);
      showNotification(error.message, "error");
      return null;
    }
  },

  // LẤY THÔNG TIN TÀI KHOẢN
  getTaiKhoanKhachHang: async () => {
    try {
      const response = await fetch(
        "http://localhost:5258/api/TaiKhoan/LayTaiKhoanKhachHang",
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
      console.error("Lỗi khi lấy thông tin tài khoản:", error);
      showNotification(error.message, "error");
      return null;
    }
  },

  // CẬP NHẬT TÀI KHOẢN & ĐỔI MẬT KHẨU
  updateTaiKhoanKhachHang: async (accountData) => {
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
        throw new Error(
          responseData.Message || "Cập nhật tài khoản không thành công"
        );
      }

      return responseData;
    } catch (error) {
      console.error("Lỗi khi cập nhật tài khoản:", error);
      showNotification(error.message, "error");
      return null;
    }
  },
};

/* ======================= 2. XỬ LÝ HIỂN THỊ DỮ LIỆU ======================= */

// Hiển thị thông tin khách hàng
async function hienThiThongTinKhachHang() {
  const userInfo = await api.getCaNhanKhachHang();
  if (userInfo) {
    document.getElementById("name").value = userInfo.hoTenKhachHang || "";
    document.getElementById("email").value = userInfo.emailKhach || "";
    document.getElementById("phone").value = userInfo.soDienThoaiKhach || "";
    document.getElementById("address").value = userInfo.diaChiKhach || "";
  }
}

// Cập nhật thông tin khách hàng
async function capNhatThongTinKhachHang(event) {
  event.preventDefault();

  const updatedUserInfo = {
    hoTenKhachHang: document.getElementById("name").value,
    emailKhach: document.getElementById("email").value,
    soDienThoaiKhach: document.getElementById("phone").value,
    diaChiKhach: document.getElementById("address").value,
  };

  const result = await api.updateCaNhanKhachHang(updatedUserInfo);
  if (result) {
    showNotification("Cập nhật thông tin thành công!", "success");
    hienThiThongTinKhachHang();
  }
}

// Hiển thị thông tin tài khoản
async function hienThiThongTinTaiKhoan() {
  const accountInfo = await api.getTaiKhoanKhachHang();
  if (accountInfo) {
    document.getElementById("username").value = accountInfo.tenDangNhap || "";
  }
}

// Cập nhật tài khoản & đổi mật khẩu
async function capNhatTaiKhoanKhachHang(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Kiểm tra dữ liệu nhập vào
  if (!username || !currentPassword || !newPassword || !confirmPassword) {
    showNotification("Vui lòng nhập đầy đủ thông tin!", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification("Mật khẩu mới nhập lại không khớp!", "error");
    return;
  }

  // Gửi dữ liệu lên API
  const updatedAccount = {
    TenDangNhap: username,
    MatKhauCu: currentPassword,
    MatKhau: newPassword,
    NhapLaiMatKhau: confirmPassword,
  };

  const result = await api.updateTaiKhoanKhachHang(updatedAccount);

  if (result) {
    showNotification("Cập nhật tài khoản thành công!", "success");
    hienThiThongTinTaiKhoan(); // Cập nhật lại giao diện
  }
}

// ====== Hiển thị thông báo ======
function showNotification(message, type = "success") {
  alert(`${type.toUpperCase()}: ${message}`);
}

/* ====== Gọi API khi tải trang ====== */
document.addEventListener("DOMContentLoaded", () => {
  hienThiThongTinKhachHang();
  hienThiThongTinTaiKhoan();
});

document.addEventListener("DOMContentLoaded", fetchOrders); // Khi trang tải, gọi API lấy đơn hàng

// ✅ Gọi API lấy danh sách đơn hàng
async function fetchOrders() {
  try {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) throw new Error("Không tìm thấy token đăng nhập!");

    const response = await fetch(
      "http://localhost:5258/api/DonHang/DanhSachCaNhan",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.Message || `Lỗi API: ${response.status}`);
    }

    displayOrders(data.$values); // Hiển thị đơn hàng
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng:", error);
    document.getElementById("orders-container").innerHTML =
      '<div class="error-message">⚠ Không thể tải danh sách đơn hàng.</div>';
  }
}

// ✅ Gọi API hủy đơn hàng
async function cancelOrder(maDonHang) {
  try {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) throw new Error("Không tìm thấy token đăng nhập!");

    const response = await fetch(
      `http://localhost:5258/api/DonHang/HuyDonHang/${maDonHang}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.Message || `API returned status ${response.status}`);
    }

    alert("✅ Đơn hàng đã được hủy thành công!");

    fetchOrders(); // Tải lại danh sách đơn hàng sau khi hủy
  } catch (error) {
    console.error("❌ Lỗi khi hủy đơn hàng:", error);
    alert("⚠ Không thể hủy đơn hàng: " + error.message);
  }
}

// ✅ Hiển thị danh sách đơn hàng
function displayOrders(orders) {
  const ordersContainer = document.getElementById("orders-container");
  ordersContainer.innerHTML = "";

  if (orders.length === 0) {
    ordersContainer.innerHTML =
      '<div class="no-orders">Bạn chưa có đơn hàng nào.</div>';
    return;
  }

  orders.forEach((order) => {
    const orderElement = document.createElement("div");
    orderElement.className = "order-card";

    // Tạo nút "Hủy đơn" nếu trạng thái là "Chờ"
    const cancelButton =
      order.trangThaiDon === "Chờ"
        ? `<button class="cancel-order-btn" onclick="cancelOrder('${order.maDonHang}')">Hủy đơn</button>`
        : "";

    // Header đơn hàng
    const orderHeader = `
  <div class="order-header">
    <div class="order-info">
      <div class="order-date">Đơn hàng ngày: ${formatDate(
        order.ngayTaoDon
      )}</div>
      <div class="order-payment">Phương thức thanh toán: ${
        order.phuongThucTt
      }</div>
      <div class="order-address">Địa chỉ nhận: ${order.diaChiNhan}</div>
    </div>
    
    ${cancelButton}
  </div>
`;

    // Bảng sản phẩm
    const orderTable = `
 <table class="order-table">
    <thead>
      <tr>
        <th>STT</th>
        <th>Sản phẩm</th>
        <th>Đơn giá (VND)</th>
        <th>Số lượng</th>
        <th>Thành tiền</th>
        <th>Trạng thái</th>
        <th>Thao tác</th>
      </tr>
    </thead>
    <tbody>
      ${
        order.chiTietDonHangs?.$values
          ?.map(
            (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.tenSanPham}</td>
            <td>${formatCurrency(item.donGia)}</td>
            <td>${item.soLuongSanPham}</td>
            <td>${formatCurrency(item.donGia * item.soLuongSanPham)}</td>
            <td><div class="order-status ${getStatusClass(order.trangThaiDon)}">
      ${order.trangThaiDon}
    </div></td>
            <td>
              ${
                order.trangThaiDon === "Đã giao"
                  ? `<button class="btn-rate" onclick="danhGiaSanPham('${item.maSanPham}')">Đánh giá</button>`
                  : `<button class="btn-rate disabled" onclick="thongBaoKhongDuDieuKien()">Đánh giá</button>`
              }
            </td>
          </tr>
        `
          )
          .join("") || ""
      }
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5" class="total-label">Tổng tiền:</td>
        <td colspan="2" class="total-amount">${formatCurrency(
          order.tongTien
        )}</td>
      </tr>
    </tfoot>
  </table>
`;
    // Hàm đánh giá sản phẩm
    function danhGiaSanPham(maSanPham) {
      // Hiển thị modal đánh giá
      openRatingModal(maSanPham);
    }
    // Gộp các phần tử vào card đơn hàng
    orderElement.innerHTML = orderHeader + orderTable;
    ordersContainer.appendChild(orderElement);
  });
}

// ✅ Định dạng số tiền thành VND
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

// ✅ Định dạng ngày từ chuỗi ISO
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ✅ Xác định màu trạng thái
function getStatusClass(status) {
  switch (status) {
    case "Đã giao":
      return "status-delivered";
    case "Hủy":
      return "status-canceled";
    default:
      return "status-waiting";
  }
}

/*Đánh giá */
// rating.js

document.addEventListener("DOMContentLoaded", function () {
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = `
      <!-- Modal đánh giá sản phẩm -->
      <div id="ratingModal" class="modal">
        <div class="modal-content">
          <span class="close" onclick="closeRatingModal()">&times;</span>
          <h2>Đánh giá sản phẩm</h2>
          <form id="ratingForm">
            <input type="hidden" id="maSanPham" name="maSanPham">
  
            <div class="rating-stars">
              <p>Đánh giá của bạn:</p>
              <div class="star-rating">
                <input type="radio" id="star5" name="rating" value="5" />
                <label for="star5" title="5 sao"></label>
                <input type="radio" id="star4" name="rating" value="4" />
                <label for="star4" title="4 sao"></label>
                <input type="radio" id="star3" name="rating" value="3" />
                <label for="star3" title="3 sao"></label>
                <input type="radio" id="star2" name="rating" value="2" />
                <label for="star2" title="2 sao"></label>
                <input type="radio" id="star1" name="rating" value="1" />
                <label for="star1" title="1 sao"></label>
              </div>
            </div>
  
            <div class="form-group">
              <label for="binhLuan">Nhận xét:</label>
              <textarea id="binhLuan" name="binhLuan" rows="4" placeholder="Nhập nhận xét của bạn về sản phẩm"></textarea>
            </div>
  
            <div class="form-actions">
              <button type="button" onclick="closeRatingModal()" class="btn-cancel">Hủy</button>
              <button type="button" onclick="guiDanhGia()" class="btn-submit">Gửi đánh giá</button>
            </div>
          </form>
        </div>
      </div>
    `;

  document.body.appendChild(modalContainer);
});

function danhGiaSanPham(maSanPham) {
  openRatingModal(maSanPham);
}

function openRatingModal(maSanPham) {
  const modal = document.getElementById("ratingModal");
  const maSanPhamInput = document.getElementById("maSanPham");
  maSanPhamInput.value = maSanPham;
  document.getElementById("ratingForm").reset();
  modal.style.display = "block";
}

function closeRatingModal() {
  document.getElementById("ratingModal").style.display = "none";
}

function thongBaoKhongDuDieuKien() {
  showNotification(
    "Bạn chỉ có thể đánh giá sản phẩm khi đơn hàng đã được giao.",
    "warning"
  );
}

async function guiDanhGia() {
  const maSanPham = document.getElementById("maSanPham").value;
  const soSaoElement = document.querySelector('input[name="rating"]:checked');
  const binhLuan = document.getElementById("binhLuan").value;

  if (!soSaoElement) {
    showNotification("Vui lòng chọn số sao đánh giá!", "warning");
    return;
  }

  const soSao = soSaoElement.value;
  const formData = new FormData();
  formData.append("MaSanPham", maSanPham);
  formData.append("SoSao", soSao);
  formData.append("BinhLuan", binhLuan);

  const authToken = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      "http://localhost:5258/api/danhgia/ThemDanhGia",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      closeRatingModal();
      showNotification("Đánh giá sản phẩm thành công!");
    } else {
      showNotification(
        data.Message || "Có lỗi xảy ra khi đánh giá sản phẩm.",
        "error"
      );
    }
  } catch (error) {
    console.error("Lỗi:", error);
    showNotification("Có lỗi xảy ra khi gửi đánh giá.", "error");
  }
}

function showNotification(message, type = "success") {
  if (typeof toast !== "undefined") {
    toast[type](message);
  } else if (typeof Swal !== "undefined") {
    Swal.fire({
      title: type === "success" ? "Thành công" : "Thông báo",
      text: message,
      icon: type,
      confirmButtonText: "Đồng ý",
    });
  } else {
    alert(message);
  }
}
