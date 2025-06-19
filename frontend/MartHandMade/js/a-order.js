function loadOrders() {
  // Hiển thị loader nếu có
  document.getElementById("order-loader")?.classList.remove("hidden");

  // Gọi API lấy danh sách đơn hàng
  fetch(
    `http://localhost:5258/api/DonHang/DanhSachDonHang
  `,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) throw new Error("Không thể tải danh sách đơn hàng");
      return response.json();
    })
    .then((data) => {
      console.log("📌 Dữ liệu API đơn hàng:", data);

      // Kiểm tra nếu API có lớp bọc `$values`
      if (data?.$values && Array.isArray(data.$values)) {
        renderOrdersTable(data.$values);
      } else {
        console.error("❌ Dữ liệu API không đúng định dạng.");
      }

      // Ẩn loader nếu có
      document.getElementById("order-loader")?.classList.add("hidden");
    })
    .catch((error) => {
      console.error("❌ Lỗi khi tải danh sách đơn hàng:", error);
      showNotification(
        "error",
        "Không thể tải danh sách đơn hàng. Vui lòng thử lại sau."
      );
      document.getElementById("order-loader")?.classList.add("hidden");
    });
}

// Hiển thị danh sách đơn hàng
function renderOrdersTable(orders) {
  const tableBody = document.querySelector("#order-table tbody");
  tableBody.innerHTML = "";

  orders.forEach((order) => {
    console.log("🔍 Đơn hàng:", order);

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${order.maDonHang}</td>
        <td>${order.tenKhachHang || "N/A"}</td>
        <td>${formatDate(order.ngayTaoDon)}</td>
        <td>${order.tongTien.toLocaleString()} đ</td>
        <td>
            <span class="status-badge ${getStatusClass(order.trangThaiDon)}">
                ${formatOrderStatus(order.trangThaiDon)}
            </span>
        </td>
        <td>${order.tenNhanVien || "Chưa có"}</td>
        <td>
            <button class="action-btn edit-order" data-id="${order.maDonHang}">
                Sửa
            </button>
            <button class="action-btn view-order" data-id="${order.maDonHang}">
                Xem chi tiết
            </button>
        </td>
      `;
    tableBody.appendChild(tr);
  });

  // Gán sự kiện cho nút "Sửa" và "Xem chi tiết"
  document.querySelectorAll(".edit-order").forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id");
      openEditOrderModal(orderId);
    });
  });

  document.querySelectorAll(".view-order").forEach((button) => {
    button.addEventListener("click", function () {
      const orderId = this.getAttribute("data-id");
      viewOrderDetails(orderId);
    });
  });
}

// Định dạng ngày tháng + giờ phút giây
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Hiển thị giờ 24h thay vì AM/PM
  });
}

// Lấy class CSS dựa vào trạng thái đơn hàng
function getStatusClass(status) {
  switch (status) {
    case "Chờ":
      return "pending";
    case "Đã duyệt":
      return "processing";
    case "Đang giao":
      return "shipping";
    case "Đã giao":
      return "completed";
    case "Hủy":
      return "cancelled";
    default:
      return "";
  }
}

// Định dạng trạng thái đơn hàng để hiển thị
function formatOrderStatus(status) {
  switch (status) {
    case "Chờ":
      return "Chờ";
    case "Đã duyệt":
      return "Đã duyệt";
    case "Đang giao":
      return "Đang giao";
    case "Đã giao":
      return "Đã giao";
    case "Hủy":
      return "Đã hủy";
    default:
      return status;
  }
}

// 🟢 Mở modal chỉnh sửa trạng thái đơn hàng
function openEditOrderModal(orderId, currentStatus) {
  console.log("📝 Chỉnh sửa đơn hàng:", orderId);

  // Tạo modal đơn giản nếu chưa có
  let modal = document.querySelector("#editOrderModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "editOrderModal";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-content">
          <span class="close-btn">&times;</span>
          <h2>Cập nhật trạng thái đơn hàng</h2>
          <label for="order-status">Trạng thái mới:</label>
          <select id="order-status">
            <option value="Chờ">Chờ</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Huỷ">Huỷ</option>
          </select>
          <button id="save-order-status">Lưu</button>
        </div>
      `;
    document.body.appendChild(modal);

    // Đóng modal khi bấm nút đóng
    modal.querySelector(".close-btn").addEventListener("click", () => {
      modal.style.display = "none";
    });

    // Xử lý khi bấm lưu
    document
      .querySelector("#save-order-status")
      .addEventListener("click", function () {
        const newStatus = document.querySelector("#order-status").value;
        updateOrderStatus(orderId, newStatus);
      });
  }

  // Đặt trạng thái hiện tại trong select
  document.querySelector("#order-status").value = currentStatus;

  // Hiển thị modal
  modal.style.display = "block";
}

function updateOrderStatus(orderId, newStatus) {
  console.log("📤 Gửi yêu cầu cập nhật trạng thái:", orderId, "➡️", newStatus);

  fetch(`http://localhost:5258/api/DonHang/CapNhatTrangThai/${orderId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ trangThaiMoi: newStatus }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }
      return response.text(); // 🔥 Đổi từ response.json() -> response.text()
    })
    .then((message) => {
      console.log("📩 Phản hồi từ API:", message);
      alert("✅ Cập nhật trạng thái đơn hàng thành công!");
      document.querySelector("#editOrderModal").style.display = "none";
      loadOrders(); // Tải lại danh sách đơn hàng
    })
    .catch((error) => {
      console.error("❌ Lỗi khi cập nhật trạng thái đơn hàng:", error);
      alert("❌ Không thể cập nhật trạng thái đơn hàng.");
    });
}

// 🔍 Xem chi tiết đơn hàng
function viewOrderDetails(orderId) {
  console.log("🔍 Xem chi tiết đơn hàng:", orderId);

  // Gửi API lấy danh sách chi tiết đơn hàng
  // 🔍 Xem chi tiết đơn hàng
  fetch(`http://localhost:5258/api/DonHang/ChiTiet/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("📥 Dữ liệu API trả về:", data); // Kiểm tra dữ liệu

      const details = data.$values || [];

      if (!Array.isArray(details) || details.length === 0) {
        throw new Error("Dữ liệu chi tiết đơn hàng không hợp lệ hoặc trống.");
      }

      showOrderDetailsModal(orderId, details);
    })
    .catch((error) => {
      console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", error);
      alert("Không thể lấy thông tin chi tiết đơn hàng.");
    });
}

// 🟢 Hiển thị modal chi tiết đơn hàng
function showOrderDetailsModal(orderId, details) {
  // Xóa modal cũ nếu có
  const existingModal = document.querySelector(".order-details-modal");
  if (existingModal) existingModal.remove();

  // Tạo modal mới
  const modal = document.createElement("div");
  modal.classList.add("order-details-modal");
  modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Chi tiết đơn hàng </h2>
        <table class="order-details-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Sản phẩm</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${details
              .map(
                (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.tenSanPham}</td>
                <td>${item.donGia.toLocaleString()} đ</td>
                <td>${item.soLuongSanPham}</td>
                <td>${(
                  item.soLuongSanPham * item.donGia
                ).toLocaleString()} đ</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

  // Thêm modal vào body
  document.body.appendChild(modal);

  // Sự kiện đóng modal
  modal.querySelector(".close-btn").addEventListener("click", () => {
    modal.remove();
  });

  // Đóng modal khi nhấn ngoài vùng modal
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
  // 🟢 Thêm CSS vào trang
  const style = document.createElement("style");
  style.innerHTML = `
    /* 🌟 Modal */
    .order-details-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999;
    }
    
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 500px;
      max-width: 90%;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      text-align: center;
      animation: fadeIn 0.3s ease-in-out;
    }
  
    /* 🌟 Nút đóng */
    .close-btn {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 22px;
      cursor: pointer;
      color: red;
    }
  
    /* 🌟 Bảng chi tiết đơn hàng */
    .order-details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
  
    .order-details-table th, .order-details-table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: center;
    }
  
    .order-details-table th {
      background-color:rgb(224, 196, 163);
    }
  
    /* Hiệu ứng mở modal */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
