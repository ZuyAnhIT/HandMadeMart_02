// 🟢 1. Lấy danh sách danh mục từ API
function loadCategories() {
  const loader = document.getElementById("category-loader");
  if (loader) loader.classList.remove("hidden");

  fetch("http://localhost:5258/api/DanhMucSanPham/LayDanhSach", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Không thể tải danh mục");
      return response.json();
    })
    .then((data) => {
      // 🟢 Kiểm tra API trả về object có `$values` không
      if (data && data.$values) {
        categories = data.$values;
      } else {
        throw new Error("Dữ liệu không đúng định dạng");
      }

      renderCategoriesTable();

      if (loader) loader.classList.add("hidden");
    })
    .catch((error) => {
      console.error("Lỗi khi tải danh mục:", error);
      showNotification("error", "Không thể tải danh mục. Vui lòng thử lại.");
      if (loader) loader.classList.add("hidden");
    });
}
// 🟢 2. Hiển thị danh mục lên bảng
function renderCategoriesTable() {
  const tableBody = document.querySelector("#category-table tbody");
  if (!tableBody) {
    console.error("Không tìm thấy bảng danh mục");
    return;
  }

  tableBody.innerHTML = ""; // Xóa dữ liệu cũ

  categories.forEach((category) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${category.maDanhMuc}</td>
        <td>${category.tenDanhMuc}</td>
        <td>
          <button class="action-btn edit-category" data-id="${category.maDanhMuc}">Sửa</button>
          <button class="action-btn delete-category" data-id="${category.maDanhMuc}">Xóa</button>
        </td>
      `;
    tableBody.appendChild(tr);
  });

  // 🟢 Gán sự kiện cho các nút Sửa & Xóa
  document.querySelectorAll(".edit-category").forEach((button) => {
    button.addEventListener("click", function () {
      const categoryId = this.getAttribute("data-id");
      openEditCategoryModal(categoryId);
    });
  });

  document.querySelectorAll(".delete-category").forEach((button) => {
    button.addEventListener("click", function () {
      const categoryId = this.getAttribute("data-id");
      deleteCategory(categoryId);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
});

// 🟢 1. Mở chế độ chỉnh sửa danh mục ngay trên bảng
function openEditCategoryModal(categoryId) {
  const category = categories.find((c) => c.maDanhMuc === categoryId);
  if (!category) {
    showNotification("error", "Không tìm thấy danh mục để chỉnh sửa.");
    return;
  }

  const row = document
    .querySelector(`button[data-id="${categoryId}"]`)
    .closest("tr");
  const nameCell = row.children[1]; // Cột chứa tên danh mục

  // Lưu giá trị cũ để khôi phục nếu cần
  const oldName = nameCell.textContent;

  // Tạo input để chỉnh sửa ngay trong bảng
  nameCell.innerHTML = `
      <input type="text" value="${category.tenDanhMuc}" class="edit-input">
      <button class="save-edit" data-id="${categoryId}">Lưu💾</button>
      <button class="cancel-edit">Hủy❌</button>
    `;

  // 🟢 2. Xử lý sự kiện khi bấm lưu chỉnh sửa
  row.querySelector(".save-edit").addEventListener("click", function () {
    updateCategory(categoryId, row.querySelector(".edit-input").value.trim());
  });

  // 🟢 3. Xử lý sự kiện khi bấm hủy chỉnh sửa
  row.querySelector(".cancel-edit").addEventListener("click", function () {
    nameCell.innerHTML = oldName; // Khôi phục tên cũ
  });
}

// 🟢 4. Gửi yêu cầu cập nhật danh mục đến API
function updateCategory(categoryId, newName) {
  if (!newName) {
    showNotification("error", "Tên danh mục không được để trống.");
    return;
  }

  const formData = new FormData();
  formData.append("TenDanhMuc", newName);

  fetch(`http://localhost:5258/api/DanhMucSanPham/CapNhat/${categoryId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) throw new Error("Cập nhật danh mục thất bại");
      return response.json();
    })
    .then((data) => {
      showNotification("success", "Cập nhật danh mục thành công!");

      // Cập nhật dữ liệu danh mục
      const category = categories.find((c) => c.maDanhMuc === categoryId);
      if (category) category.tenDanhMuc = newName;

      renderCategoriesTable(); // Cập nhật lại bảng
    })
    .catch((error) => {
      console.error("Lỗi khi cập nhật danh mục:", error);
      showNotification("error", "Không thể cập nhật danh mục.");
    });
}

/////////////////

// 🟢 1. Gán sự kiện click cho nút Xóa
document.querySelectorAll(".delete-category").forEach((button) => {
  button.addEventListener("click", function () {
    const categoryId = this.getAttribute("data-id");
    deleteCategory(categoryId);
  });
});

// 🟢 2. Hàm xóa danh mục
function deleteCategory(categoryId) {
  if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

  fetch(`http://localhost:5258/api/DanhMucSanPham/Xoa/${categoryId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  })
    .then(async (response) => {
      const responseText = await response.text();
      if (!response.ok)
        throw new Error(responseText || "Xóa danh mục thất bại");
      return JSON.parse(responseText);
    })
    .then((data) => {
      showNotification("success", "Xóa danh mục thành công!");
      categories = categories.filter((c) => c.maDanhMuc !== categoryId);
      renderCategoriesTable();
    })
    .catch((error) => {
      console.error("Lỗi khi xóa danh mục:", error.message);
      showNotification("error", error.message);
    });
}

/////////////////

// Thêm
document.addEventListener("DOMContentLoaded", function () {
  const addCategoryBtn = document.getElementById("add-category-btn");

  if (!addCategoryBtn) {
    console.error("Không tìm thấy nút 'Thêm danh mục'. Kiểm tra lại HTML!");
    return;
  }

  addCategoryBtn.addEventListener("click", function () {
    console.log("Nút 'Thêm danh mục' được nhấn!");
    openAddCategoryModal();
  });
});

// 🟢 Xử lý khi nhấn nút "Lưu"
function addCategory() {
  const categoryName = document.getElementById("category-name").value.trim();

  if (!categoryName) {
    showNotification("error", "Tên danh mục không được để trống!");
    return;
  }

  // 🔹 Sử dụng FormData để gửi dữ liệu đúng kiểu `[FromForm]`
  const formData = new FormData();
  formData.append("TenDanhMuc", categoryName); // Tên phải đúng với API yêu cầu

  fetch("http://localhost:5258/api/danhmucsanpham/ThemDanhMuc", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Nếu API yêu cầu xác thực
      // ❌ KHÔNG THÊM 'Content-Type': 'application/json' vì đang dùng FormData
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Không thể thêm danh mục");
      }
      return response.json();
    })
    .then((data) => {
      showNotification("success", "Thêm danh mục thành công!");
      closeCategoryModal();
      loadCategories(); // Cập nhật lại danh sách danh mục sau khi thêm
    })
    .catch((error) => {
      console.error("Lỗi khi thêm danh mục:", error);
      showNotification("error", "Lỗi khi thêm danh mục!");
    });
}

// 🟢 Hiển thị form modal để nhập tên danh mục
function openAddCategoryModal() {
  console.log("Mở modal thêm danh mục!");

  // Xóa modal cũ nếu có
  let oldModal = document.getElementById("category-modal");
  if (oldModal) oldModal.remove();

  // 🏗️ Tạo modal
  const modal = document.createElement("div");
  modal.id = "category-modal";
  modal.classList.add("modal-overlay");
  modal.innerHTML = `
      <div class="modal-content">
        <h2>Thêm danh mục mới</h2>
        <label for="category-name">Tên danh mục:</label>
        <input type="text" id="category-name" placeholder="Nhập tên danh mục" />
        <div class="modal-actions">
          <button id="save-category-btn" class="action-btn">Lưu</button>
          <button id="close-modal-btn" class="cancel-btn">Hủy</button>
        </div>
      </div>
    `;

  // 🏗️ Thêm modal vào body
  document.body.appendChild(modal);

  // 🟢 Gán sự kiện một cách chắc chắn
  document
    .getElementById("save-category-btn")
    .addEventListener("click", addCategory);
  document
    .getElementById("close-modal-btn")
    .addEventListener("click", closeCategoryModal);
}

// 🟢 Đóng modal
function closeCategoryModal() {
  console.log("Đóng modal!");
  const modal = document.getElementById("category-modal");
  if (modal) modal.remove();
}

// 🟢 CSS cơ bản để modal hiển thị
const style = document.createElement("style");
style.innerHTML = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
  
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      min-width: 300px;
      text-align: center;
    }
  
    .modal-actions {
      margin-top: 15px;
      display: flex;
      justify-content: space-around;
    }
  
    .action-btn, .cancel-btn {
      padding: 10px 15px;
      cursor: pointer;
    }
  
    .action-btn {
      border: none;
    }
  
    .cancel-btn {
      background-color: #dc3545;
      color: white;
      border: none;
    }
  `;
document.head.appendChild(style);
