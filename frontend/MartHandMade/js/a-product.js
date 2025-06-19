document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
});

// 🟢 Lấy danh sách sản phẩm
function loadProducts() {
  fetch("http://localhost:5258/api/SanPham/LayDanhSach", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data?.data?.$values) {
        renderProductsTable(data.data.$values);
      }
    })
    .catch((error) => {
      console.error("❌ Lỗi khi tải danh sách sản phẩm:", error);
    });
}

// 🟢 Hiển thị danh sách sản phẩm
function renderProductsTable(products) {
  const tableBody = document.querySelector("#product-table tbody");
  tableBody.innerHTML = "";

  products.forEach((product) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", product.maSanPham);
    console.log(
      "Trạng thái:",
      product.trangThai,
      "➡️ Class:",
      getStatusClass(product.trangThai)
    );

    tr.innerHTML = `
        <td>${product.tenSanPham}</td>
        <td>${product.moTa || "Không có mô tả"}</td> 
        <td>${product.giaBan.toLocaleString()} đ</td>
        <td>${product.soLuongTon}</td>
        <td>${product.soLuongBan}</td>
        <td><img src="${
          product.anhSanPham
        }" alt="Ảnh" style="width: 50px; height: 50px;"></td>
        <td><span class="status-badge ${getStatusClass(product.trangThai)}">${
      product.trangThai
    }</span></td>
        <td>${formatDate(product.ngayTao) || "N/A"}</td>
        <td>${product.tenDanhMuc || "Không có"}</td>
        <td><button class="edit-btn" data-id="${
          product.maSanPham
        }">Sửa</button></td>
      `;

    tableBody.appendChild(tr);
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      openEditProductRow(this.getAttribute("data-id"));
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
// 🟢 Chỉnh sửa sản phẩm ngay trên bảng
function openEditProductRow(productId) {
  const row = document.querySelector(`tr[data-id="${productId}"]`);
  if (!row) return;

  const cells = row.children;
  const oldValues = {
    name: cells[0].textContent,
    description: cells[1].textContent.trim(),
    price: cells[2].textContent.replace(" đ", "").replace(/,/g, ""),
    stock: cells[3].textContent,
    sold: cells[4].textContent,
    image: cells[5].querySelector("img").src,
    status: cells[6].textContent.trim(),
    date: cells[7].textContent.trim(),
    category: cells[8].textContent.trim(),
  };

  // Biến thành input để chỉnh sửa
  cells[0].innerHTML = `<input type="text" value="${oldValues.name}" class="edit-input">`;
  cells[1].innerHTML = `<textarea class="edit-input">${oldValues.description}</textarea>`;
  cells[2].innerHTML = `<input type="text" value="${oldValues.price}" class="edit-input">`;
  cells[3].innerHTML = `<input type="number" value="${oldValues.stock}" class="edit-input">`;
  cells[5].innerHTML = `<input type="text" value="${oldValues.image}" class="edit-input">`;
  cells[6].innerHTML = `
      <select class="edit-input">
        <option value="Còn hàng" ${
          oldValues.status === "Còn hàng" ? "selected" : ""
        }>Còn hàng</option>
        <option value="Hết hàng" ${
          oldValues.status === "Hết hàng" ? "selected" : ""
        }>Hết hàng</option>
        <option value="Dừng bán" ${
          oldValues.status === "Dừng bán" ? "selected" : ""
        }>Dừng bán</option>
      </select>
    `;
  cells[8].innerHTML = `<input type="text" value="${oldValues.category}" class="edit-input">`;

  // Nút lưu & hủy
  cells[9].innerHTML = `
      <button class="save-edit" data-id="${productId}">Lưu</button>
      <button class="cancel-edit">Hủy</button>
    `;

  row.querySelector(".save-edit").addEventListener("click", function () {
    updateProduct(
      productId,
      row.querySelector("td:nth-child(1) input").value.trim(),
      row.querySelector("td:nth-child(2) textarea").value.trim(),
      row.querySelector("td:nth-child(3) input").value.trim(),
      parseInt(row.querySelector("td:nth-child(4) input").value),
      row.querySelector("td:nth-child(6) input").value.trim(),
      row.querySelector("td:nth-child(7) select").value,
      row.querySelector("td:nth-child(9) input").value.trim()
    );
  });

  row.querySelector(".cancel-edit").addEventListener("click", function () {
    loadProducts();
  });
}

function updateProduct(
  productId,
  newName,
  newDescription,
  newPrice,
  newStock,
  newImage,
  newStatus,
  newCategoryName
) {
  if (!newCategoryName) {
    alert("Danh mục không hợp lệ!");
    return;
  }

  const formData = new FormData();
  formData.append("TenSanPham", newName);
  formData.append("MoTa", newDescription);
  formData.append("GiaBan", newPrice);
  formData.append("SoLuongTon", newStock);
  formData.append("AnhSanPham", newImage);
  formData.append("TrangThai", newStatus);
  formData.append("TenDanhMuc", newCategoryName);

  fetch(`http://localhost:5258/api/SanPham/CapNhat/${productId}`, {
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
      return response.text(); // Không dùng response.json() vì API FromForm có thể trả về text
    })
    .then(() => {
      alert("Cập nhật sản phẩm thành công!");
      loadProducts();
    })
    .catch((error) => {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      alert("Không thể cập nhật sản phẩm.");
    });
}

function getStatusClass(status) {
  if (!status) return "inactive"; // Nếu không có trạng thái, mặc định là inactive

  const normalizedStatus = status.trim().toLowerCase(); // Xóa khoảng trắng + chuyển về chữ thường

  switch (normalizedStatus) {
    case "còn hàng":
      return "active"; // Xanh lá
    case "hết hàng":
      return "warning"; // Vàng
    case "dừng bán":
      return "stopped"; // Đỏ
    default:
      return "inactive"; // Xám
  }
}

// 🏷️ Định dạng trạng thái sản phẩm để hiển thị
function formatProductStatus(status) {
  switch (status) {
    case "Còn hàng":
      return "Còn hàng";
    case "Hết hàng":
      return "Hết hàng";
    case "Dừng bán":
      return "Dừng bán";
    default:
      return status;
  }
}

////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  const addProductBtn = document.getElementById("add-product-btn");

  if (!addProductBtn) {
    console.error("Không tìm thấy nút 'Thêm sản phẩm'. Kiểm tra lại HTML!");
    return;
  }

  addProductBtn.addEventListener("click", function () {
    console.log("Nút 'Thêm sản phẩm' được nhấn!");
    openAddProductModal();
  });
});

// 🟢 Xử lý khi nhấn nút "Lưu"
function addProduct() {
  const productName = document.getElementById("product-name").value.trim();
  const description = document
    .getElementById("product-description")
    .value.trim();
  const price = parseFloat(document.getElementById("product-price").value);
  const stock = parseInt(document.getElementById("product-stock").value);
  const soldQuantity = parseInt(document.getElementById("product-sold").value);
  const imageUrl = document.getElementById("product-image").value.trim(); // 🔹 Nhập link ảnh
  const status = document.getElementById("product-status").value; // 🔹 Lấy trạng thái
  const categoryName = document.getElementById("product-category").value.trim();

  if (!productName || !categoryName) {
    showNotification(
      "error",
      "Tên sản phẩm và tên danh mục không được để trống!"
    );
    return;
  }

  if (!description) {
    showNotification("error", "Mô tả sản phẩm không được để trống!");
    return;
  }

  if (isNaN(price) || price < 0) {
    showNotification("error", "Giá bán phải là số hợp lệ!");
    return;
  }

  if (isNaN(stock) || stock < 0) {
    showNotification("error", "Số lượng tồn phải là số hợp lệ!");
    return;
  }

  if (isNaN(soldQuantity) || soldQuantity < 0) {
    showNotification("error", "Số lượng bán phải là số hợp lệ!");
    return;
  }

  if (!imageUrl.startsWith("http")) {
    showNotification("error", "Ảnh sản phẩm phải là đường link hợp lệ!");
    return;
  }

  // 🔹 Dùng FormData để gửi dữ liệu phù hợp với [FromForm]
  const formData = new FormData();
  formData.append("TenSanPham", productName);
  formData.append("MoTa", description);
  formData.append("GiaBan", price);
  formData.append("SoLuongTon", stock);
  formData.append("SoLuongBan", soldQuantity);
  formData.append("TrangThai", status); // 🔹 Gửi trạng thái
  formData.append("TenDanhMuc", categoryName);
  formData.append("AnhSanPham", imageUrl); // 🔹 Gửi link ảnh

  fetch("http://localhost:5258/api/sanpham/ThemSanPham", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Nếu API yêu cầu xác thực
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Không thể thêm sản phẩm");
      }
      return response.json();
    })
    .then((data) => {
      showNotification("success", "Thêm sản phẩm thành công!");
      closeProductModal();
      loadProducts();
    })
    .catch((error) => {
      console.error("Lỗi khi thêm sản phẩm:", error);
      showNotification("error", "Lỗi khi thêm sản phẩm!");
    });
}

// 🟢 Mở modal thêm sản phẩm
function openAddProductModal() {
  console.log("Mở modal thêm sản phẩm!");

  let oldModal = document.getElementById("product-modal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "product-modal";
  modal.classList.add("modal-overlay");
  modal.innerHTML = `
      <div class="modal-content">
        <h2>Thêm sản phẩm mới</h2>
        
        <label for="product-name">Tên sản phẩm:</label>
        <input type="text" id="product-name" placeholder="Nhập tên sản phẩm" />
        
        <label for="product-description">Mô tả sản phẩm:</label>
        <textarea id="product-description" placeholder="Nhập mô tả sản phẩm"></textarea>
        
        <label for="product-price">Giá bán:</label>
        <input type="number" id="product-price" placeholder="Nhập giá bán" />
        
        <label for="product-stock">Số lượng tồn:</label>
        <input type="number" id="product-stock" placeholder="Nhập số lượng tồn" />
        
        <label for="product-sold">Số lượng bán:</label>
        <input type="number" id="product-sold" placeholder="Nhập số lượng bán" />
        
        <label for="product-category">Tên danh mục:</label>
        <input type="text" id="product-category" placeholder="Nhập tên danh mục" />
        
        <label for="product-image">Link ảnh sản phẩm:</label>
        <input type="text" id="product-image" placeholder="Nhập URL ảnh sản phẩm" />
        
        <label for="product-status">Trạng thái:</label>
        <select id="product-status">
          <option value="Còn hàng">Còn hàng</option>
          <option value="Hết hàng">Hết hàng</option>
          <option value="Dừng bán">Dừng bán</option>
        </select>
        
        <div class="modal-actions">
          <button id="save-product-btn" class="action-btn">Lưu</button>
          <button id="close-modal-btn" class="cancel-btn">Hủy</button>
        </div>
      </div>
    `;

  document.body.appendChild(modal);

  document
    .getElementById("save-product-btn")
    .addEventListener("click", addProduct);
  document
    .getElementById("close-modal-btn")
    .addEventListener("click", closeProductModal);
}

// 🟢 Đóng modal
function closeProductModal() {
  console.log("Đóng modal!");
  const modal = document.getElementById("product-modal");
  if (modal) modal.remove();
}
