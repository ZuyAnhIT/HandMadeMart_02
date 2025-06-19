// Chờ DOM load xong
document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo slider
  initSlider();

  // Khởi tạo số lượng trong giỏ hàng
  updateCartCount();

  // Xử lý sự kiện khi di chuột vào menu danh mục
  const categoryMenu = document.querySelector(".dropdown");
  const dropdown =
    document.getElementById("categories-dropdown") ||
    document.querySelector(".dropdown-content");
  const footerCategories =
    document.getElementById("footer-categories") ||
    document.querySelector(".footer-categories");

  if (categoryMenu && dropdown) {
    categoryMenu.addEventListener("mouseenter", async function () {
      // Kiểm tra xem chúng ta đã tải danh mục chưa
      if (!dropdown.querySelector("a") || dropdown.querySelector(".loading")) {
        dropdown.innerHTML = '<div class="loading">Đang tải...</div>';
        const categories = await fetchCategories();
        renderCategories(categories, dropdown);
      }
    });
  }

  // Tải danh mục cho footer
  if (footerCategories) {
    (async function loadFooterCategories() {
      footerCategories.innerHTML = '<div class="loading">Đang tải...</div>';
      const categories = await fetchCategories();
      renderCategories(categories, footerCategories, true);
    })();
  }

  // Lấy danh sách sản phẩm
  fetchSanPhams();
});

// Hàm khởi tạo slider
function initSlider() {
  // Kiểm tra xem các phần tử slider có tồn tại không
  if (!document.getElementById("mainSlider")) return;

  currentSlide = 0;
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dot");

  // Tự động chuyển slide sau 5 giây
  setInterval(() => {
    changeSlide(1);
  }, 5000);
}

// Các hàm điều khiển slider
function changeSlide(step) {
  const slides = document.querySelectorAll(".slide");
  if (!slides.length) return;

  currentSlide += step;
  if (currentSlide < 0) {
    currentSlide = slides.length - 1;
  } else if (currentSlide >= slides.length) {
    currentSlide = 0;
  }
  updateSlider();
}

function goToSlide(index) {
  currentSlide = index;
  updateSlider();
}

function updateSlider() {
  const sliderElement = document.getElementById("mainSlider");
  const dots = document.querySelectorAll(".slider-dot");

  if (!sliderElement) return;

  sliderElement.style.transform = `translateX(-${currentSlide * 100}%)`;

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
}

// Hàm để lấy danh mục từ API
async function fetchCategories() {
  try {
    // Thay thế URL này bằng API thực tế của bạn
    const response = await fetch(
      "http://localhost:5258/api/danhmucsanpham/LayDanhSach"
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.$values || []; // Lấy danh sách danh mục từ API
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Hàm để render danh mục vào dropdown
function renderCategories(categories, container, isFooter = false) {
  // Xóa thông báo "Đang tải"
  container.innerHTML = "";

  if (!categories || categories.length === 0) {
    container.innerHTML = '<div class="loading">Không có danh mục nào</div>';
    return;
  }

  // Thêm mỗi danh mục vào container
  categories.forEach((category) => {
    const link = document.createElement("a");
    link.href = `products.html?category=${category.maDanhMuc}`;
    link.textContent = category.tenDanhMuc;

    // Thêm sự kiện click cho mỗi danh mục
    link.addEventListener("click", function (event) {
      event.preventDefault(); // Ngăn hành vi mặc định của thẻ a
      window.location.href = `products.html?category=${
        category.maDanhMuc
      }&name=${encodeURIComponent(category.tenDanhMuc)}`;
    });

    container.appendChild(link);
  });
}

// Hàm lấy danh sách sản phẩm từ API
async function fetchSanPhams() {
  try {
    console.log("Đang lấy danh sách sản phẩm...");
    const response = await fetch(
      "http://localhost:5258/api/sanpham/LayDanhSach"
    );

    if (!response.ok) {
      throw new Error(
        `API response error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("Kết quả API:", result);

    if (!result || !result.data || !result.data.$values) {
      console.error("Cấu trúc dữ liệu không đúng:", result);
      throw new Error("Dữ liệu API không hợp lệ");
    }

    const sanPhams = result.data.$values;
    console.log("Danh sách sản phẩm:", sanPhams);

    // Chia sản phẩm theo tiêu chí
    const sanPhamMoi = sanPhams
      .sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao))
      .slice(0, 5); // Hiển thị 5 sản phẩm

    const sanPhamBanChay = sanPhams
      .sort((a, b) => b.soLuongBan - a.soLuongBan)
      .slice(0, 5); // Hiển thị 5 sản phẩm

    // Hiển thị sản phẩm
    renderSanPham("sanPhamMoi", sanPhamMoi);
    renderSanPham("sanPhamBanChay", sanPhamBanChay);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    // Hiển thị thông báo lỗi trên trang
    displayErrorMessage(
      "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."
    );
  }
}

// Hiển thị thông báo lỗi
function displayErrorMessage(message) {
  const containers = ["sanPhamMoi", "sanPhamBanChay"];
  containers.forEach((id) => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = `<div class="error-message">${message}</div>`;
    }
  });
}

// Hàm render sản phẩm
function renderSanPham(containerId, sanPhamList) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container với id "${containerId}" không tồn tại`);
    return;
  }

  if (!sanPhamList || sanPhamList.length === 0) {
    container.innerHTML =
      '<div class="no-products">Không có sản phẩm nào</div>';
    return;
  }

  let html = "";
  sanPhamList.forEach((sp) => {
    const anhSanPham = sp.anhSanPham || "assets/images/default-product.jpg";

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
  const overlay = element.querySelector(".cart-overlay");
  if (overlay) {
    overlay.style.opacity = "1";
  }
}

function anGioHang(element) {
  const overlay = element.querySelector(".cart-overlay");
  if (overlay) {
    overlay.style.opacity = "0";
  }
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

// Tìm kiếm
document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.querySelector(".search form");
  const searchInput = document.querySelector('.search input[name="keyword"]');

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const keyword = searchInput.value.trim();

    if (keyword === "") {
      alert("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    // Tạo FormData để gửi dữ liệu
    const formData = new FormData();
    formData.append("tenSanPham", keyword);

    // Hiển thị trạng thái đang tải
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading-indicator";
    loadingIndicator.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Đang tìm kiếm...';
    document.body.appendChild(loadingIndicator);

    // Gọi API tìm kiếm
    fetch("http://localhost:5258/api/sanpham/TimKiemSanPham", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        // Xóa trạng thái đang tải
        document.body.removeChild(loadingIndicator);

        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(
              err.Message || "Có lỗi xảy ra khi tìm kiếm sản phẩm."
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        // Lưu kết quả và từ khóa vào localStorage
        localStorage.setItem("searchResults", JSON.stringify(data));
        localStorage.setItem("searchKeyword", keyword);
        localStorage.setItem("searchTimestamp", new Date().toISOString());

        // Chuyển hướng sang trang hiển thị kết quả
        window.location.href = "products_share.html";
      })
      .catch((error) => {
        // Xóa trạng thái đang tải nếu chưa xóa
        if (document.querySelector(".loading-indicator")) {
          document.body.removeChild(loadingIndicator);
        }

        console.error("Lỗi tìm kiếm:", error);
        alert(error.message);
      });
  });
});
