document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra URL để xem có tham số danh mục không
  const urlParams = new URLSearchParams(window.location.search);
  const maDanhMucChon = urlParams.get("category");

  // Lấy danh sách sản phẩm theo danh mục
  fetchSanPhamTheoMaDanhMuc(maDanhMucChon);

  // Cập nhật số lượng giỏ hàng khi trang tải
  updateCartCount();
});

// Lấy danh sách sản phẩm từ API
async function fetchSanPhamTheoMaDanhMuc(maDanhMucChon) {
  try {
    const loadingContainer = document.getElementById("loadingContainer");
    const errorContainer = document.getElementById("errorContainer");

    // Reset containers
    errorContainer.innerHTML = "";

    // Fetch API
    const response = await fetch(
      "http://localhost:5258/api/sanpham/LayDanhSach"
    );
    const result = await response.json();

    if (!result || !result.data || !result.data.$values) {
      throw new Error("Dữ liệu API không hợp lệ");
    }

    // Hide loading
    loadingContainer.style.display = "none";

    // Lấy danh sách sản phẩm
    let sanPhams = result.data.$values;

    // Nếu có mã danh mục được chọn, lọc chỉ hiển thị sản phẩm của danh mục đó
    if (maDanhMucChon) {
      sanPhams = sanPhams.filter((sp) => sp.maDanhMuc === maDanhMucChon);

      // Hiển thị tiêu đề danh mục đã chọn nếu có thông tin từ URL
      const tenDanhMuc = new URLSearchParams(window.location.search).get(
        "name"
      );
      if (tenDanhMuc) {
        // Hiển thị tên danh mục trong một phần tử nào đó trên trang
        const pageTitle =
          document.getElementById("pageTitle") || document.querySelector("h1");
        if (pageTitle) {
          pageTitle.textContent = decodeURIComponent(tenDanhMuc);
        }
      }
    }

    // Nhóm sản phẩm theo danh mục
    let sanPhamTheoDanhMuc = groupByDanhMuc(sanPhams);

    // Render sản phẩm theo danh mục
    renderSanPhamTheoDanhMuc(sanPhamTheoDanhMuc);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    errorContainer.innerHTML = `<div class="error-message">Không thể kết nối đến máy chủ.</div>`;

    // Ẩn loading
    document.getElementById("loadingContainer").style.display = "none";
  }
}

// Hàm nhóm sản phẩm theo danh mục
function groupByDanhMuc(sanPhams) {
  const result = {};

  sanPhams.forEach((sp) => {
    // Lấy thông tin danh mục từ sản phẩm
    const maDanhMuc = sp.maDanhMuc || "khong-phan-loai";
    const tenDanhMuc = sp.tenDanhMuc || "Chưa phân loại";

    // Tạo mảng danh mục nếu chưa tồn tại
    if (!result[maDanhMuc]) {
      result[maDanhMuc] = {
        tenDanhMuc: tenDanhMuc,
        sanPhams: [],
      };
    }

    // Thêm sản phẩm vào danh mục
    result[maDanhMuc].sanPhams.push(sp);
  });

  return result;
}

// Hàm render sản phẩm theo danh mục
function renderSanPhamTheoDanhMuc(sanPhamTheoDanhMuc) {
  const danhMucContainer = document.getElementById("danhMucContainer");
  danhMucContainer.innerHTML = "";

  // Duyệt qua từng danh mục
  for (const maDanhMuc in sanPhamTheoDanhMuc) {
    const danhMuc = sanPhamTheoDanhMuc[maDanhMuc];

    // Tạo container cho danh mục
    const danhMucElement = document.createElement("div");
    danhMucElement.className = "danh-muc-container";
    danhMucElement.innerHTML = `
        <h2 class="danh-muc-heading">${danhMuc.tenDanhMuc}</h2>
        <div id="danhMuc_${maDanhMuc}" class="san-pham-row"></div>
      `;

    danhMucContainer.appendChild(danhMucElement);

    // Render sản phẩm trong danh mục
    renderSanPham(`danhMuc_${maDanhMuc}`, danhMuc.sanPhams);
  }

  // Thêm sự kiện hover cho tất cả sản phẩm sau khi render
  setupSanPhamInteractions();
}

// Hàm render danh sách sản phẩm
function renderSanPham(containerId, sanPhamList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = "";
  sanPhamList.forEach((sp) => {
    const anhSanPham = sp.anhSanPham || "default-product.jpg";

    html += `
      <div class="san-pham" onmouseenter="hienGioHang(this)" onmouseleave="anGioHang(this)" onclick="chiTietSanPham('${
        sp.maSanPham
      }')">
          <img src="${anhSanPham}" alt="${
      sp.tenSanPham
    }" onerror="this.src='assets/images/default-product.jpg'" />
          <h3>${sp.tenSanPham}</h3>
          <p>Đã Bán: ${sp.soLuongBan}</p>
          <p><strong>Giá: ${sp.giaBan.toLocaleString()} VND</strong></p>
          <div class="cart-overlay">
              <button onclick="themVaoGioHang(event, '${
                sp.maSanPham
              }', '${sp.tenSanPham.replace(/'/g, "\\'")}', ${sp.giaBan})">
                  <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
              </button>
          </div>
      </div>`;
  });

  container.innerHTML = html;
}

function hienGioHang(element) {
  element.querySelector(".cart-overlay").style.opacity = "1";
}

function anGioHang(element) {
  element.querySelector(".cart-overlay").style.opacity = "0";
}

function chiTietSanPham(maSanPham) {
  // Chuyển hướng đến trang chi tiết sản phẩm
  window.location.href = `product-detail.html?id=${maSanPham}`;
}

function themVaoGioHang(event, maSanPham, tenSanPham, giaBan) {
  event.stopPropagation();

  let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];

  let sanPhamTonTai = gioHang.find((sp) => sp.maSanPham === maSanPham);

  if (sanPhamTonTai) {
    sanPhamTonTai.soLuong += 1;
  } else {
    gioHang.push({
      maSanPham,
      tenSanPham,
      giaBan,
      soLuong: 1,
    });
  }

  localStorage.setItem("gioHang", JSON.stringify(gioHang));
  updateCartCount();

  // Hiển thị thông báo
  showNotification("Đã thêm sản phẩm vào giỏ hàng!");
}

function updateCartCount() {
  const gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
  const tongSoLuong = gioHang.reduce((tong, sp) => tong + sp.soLuong, 0);

  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = tongSoLuong;
  }
}

function showNotification(message) {
  // Kiểm tra xem đã có thông báo chưa
  let notification = document.querySelector(".notification");

  // Nếu chưa có, tạo mới
  if (!notification) {
    notification = document.createElement("div");
    notification.className = "notification";
    document.body.appendChild(notification);
  }

  // Hiển thị thông báo
  notification.textContent = message;
  notification.classList.add("show");

  // Tự động ẩn sau 2 giây
  setTimeout(() => {
    notification.classList.remove("show");
  }, 2000);
}
