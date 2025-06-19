// 🔹 Lấy ID sản phẩm từ URL
function layIDSanPham() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔹 Gọi API để lấy thông tin sản phẩm (hoặc dữ liệu mẫu nếu API lỗi)
async function hienThiSanPham() {
  const id = layIDSanPham();
  if (!id) {
    document.querySelector(".product-detail-container").innerHTML =
      "<p>ID sản phẩm không hợp lệ!</p>";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5258/api/sanpham/LaySanPham/${id}`
    );
    if (!response.ok) throw new Error("Không tìm thấy sản phẩm!");

    const sanPham = await response.json();
    capNhatGiaoDienSanPham(sanPham);
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    const dummyData = createDummyData();
    capNhatGiaoDienSanPham(dummyData);
  }
}

// 🔹 Cập nhật giao diện sản phẩm
function capNhatGiaoDienSanPham(sanPham) {
  document.getElementById("product-name").innerText = sanPham.tenSanPham;
  document.getElementById("product-description").innerText =
    " Mô tả chi tiết: " + sanPham.moTa;
  document.getElementById("product-price").innerText =
    "Giá bán: " + sanPham.giaBan.toLocaleString() + " VNĐ";
  document.getElementById("product-image").src = sanPham.anhSanPham;
  document.getElementById("product-status").innerText =
    "Trạng thái sản phẩm: " + sanPham.trangThai ? "Còn hàng" : "Hết hàng";
  document.getElementById(
    "product-stock"
  ).innerText = `Số lượng còn: ${sanPham.soLuongTon}`;
  document.getElementById("product-category").innerText =
    " Danh mục: " + sanPham.tenDanhMuc;
}

// 🔹 Xử lý thêm sản phẩm vào giỏ hàng và chuyển hướng
function themVaoGioHang(event) {
  event.stopPropagation();

  const id = layIDSanPham();
  if (!id) return;

  const tenSanPham = document.getElementById("product-name").innerText;
  const giaBan = parseInt(
    document.getElementById("product-price").innerText.replace(" VNĐ", ""),
    10
  );

  let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];

  const sanPhamIndex = gioHang.findIndex((item) => item.maSanPham === id);
  if (sanPhamIndex !== -1) {
    gioHang[sanPhamIndex].soLuong += 1;
  } else {
    gioHang.push({ maSanPham: id, tenSanPham, giaBan, soLuong: 1 });
  }

  localStorage.setItem("gioHang", JSON.stringify(gioHang));
  updateCartCount();

  // Chuyển hướng sang trang giỏ hàng
  window.location.href = "cart.html";
}

// 🔹 Cập nhật số lượng giỏ hàng hiển thị
function updateCartCount() {
  const gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
  const tongSoLuong = gioHang.reduce((tong, sp) => tong + sp.soLuong, 0);

  const cartCountElement = document.querySelector(".cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = tongSoLuong;
  }
}

// 🔹 Hàm tạo dữ liệu mẫu khi API lỗi
function createDummyData() {
  return {
    tenSanPham: "Sản phẩm mẫu",
    moTa: "Đây là mô tả sản phẩm mẫu.",
    giaBan: 100000,
    anhSanPham: "default.jpg",
    trangThai: true,
    soLuongTon: 50,
  };
}

// 🔹 Chia sẻ sản phẩm lên mạng xã hội
function chiaSe(lenMang) {
  const url = window.location.href;
  let shareURL = "";

  switch (lenMang) {
    case "facebook":
      shareURL = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case "twitter":
      shareURL = `https://twitter.com/intent/tweet?url=${url}`;
      break;
    case "instagram":
      shareURL = `https://www.instagram.com/", "_blank`;
      break;
  }

  window.open(shareURL, "_blank");
}

// 🔹 Chạy khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
  hienThiSanPham();
  updateCartCount();
});

// Đánh giá
document.addEventListener("DOMContentLoaded", function () {
  // Lấy thông tin sản phẩm hiện tại từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id"); // Giả sử ID sản phẩm được truyền qua tham số URL 'id'

  console.log("ID sản phẩm từ URL:", productId); // Log để kiểm tra

  if (!productId) {
    console.error("ID sản phẩm không tồn tại trong URL");
    document.querySelector("#reviews-slider").innerHTML =
      '<div class="reviews-error">Không thể tải đánh giá: Thiếu mã sản phẩm</div>';
    return;
  }

  // Gọi API để lấy đánh giá
  fetchReviews(productId);
});

async function fetchReviews(productId) {
  try {
    console.log("Đang gọi API với mã sản phẩm:", productId);

    // Hiển thị trạng thái đang tải
    document.querySelector("#reviews-slider").innerHTML =
      '<div class="reviews-loading">Đang tải đánh giá...</div>';

    // Xây dựng URL API
    const apiUrl = `http://localhost:5258/api/danhgia/SanPham/${productId}`;
    console.log("URL API:", apiUrl);

    const response = await fetch(apiUrl);
    console.log("Trạng thái response:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(
        `Không thể tải đánh giá: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Dữ liệu nhận được:", data);

    // Kiểm tra cấu trúc dữ liệu
    if (!data || !data.$values) {
      console.error("Cấu trúc dữ liệu không đúng:", data);
      throw new Error("Cấu trúc dữ liệu không đúng định dạng");
    }

    // Lấy mảng đánh giá từ cấu trúc JSON
    const reviews = data.$values || [];
    console.log("Số lượng đánh giá:", reviews.length);

    renderReviews(reviews);
    setupSlider(reviews.length);
  } catch (error) {
    console.error("Lỗi khi tải đánh giá:", error);
    document.querySelector(
      "#reviews-slider"
    ).innerHTML = `<div class="reviews-error">Không thể tải đánh giá: ${error.message}</div>`;
  }
}

function renderReviews(reviews) {
  const sliderElement = document.querySelector("#reviews-slider");

  if (reviews.length === 0) {
    sliderElement.innerHTML =
      '<div class="no-reviews">Chưa có đánh giá nào cho sản phẩm này</div>';
    document.querySelector("#average-stars").textContent = "0";
    document.querySelector("#reviews-count").textContent = "0";
    document.querySelector("#summary-stars").innerHTML = generateStars(0);
    return;
  }

  // Tính điểm trung bình
  const totalStars = reviews.reduce((sum, review) => sum + review.soSao, 0);
  const averageStars = (totalStars / reviews.length).toFixed(1);

  // Cập nhật thông tin đánh giá tổng
  document.querySelector("#average-stars").textContent = averageStars;
  document.querySelector("#reviews-count").textContent = reviews.length;
  document.querySelector("#summary-stars").innerHTML =
    generateStars(averageStars);

  // Tạo các thẻ đánh giá
  sliderElement.innerHTML = "";
  reviews.forEach((review) => {
    const reviewCard = document.createElement("div");
    reviewCard.className = "review-card";

    // Định dạng ngày
    const reviewDate = new Date(review.ngayDanhGia);
    const formattedDate = `${reviewDate.getDate()}/${
      reviewDate.getMonth() + 1
    }/${reviewDate.getFullYear()}`;

    reviewCard.innerHTML = `
      <div class="review-header">
        <div class="review-name">${review.tenKhachHang}</div>
        <div class="review-date">${formattedDate}</div>
      </div>
      <div class="review-stars">${generateStars(review.soSao)}</div>
      <div class="review-comment">${
        review.binhLuan || "Không có bình luận"
      }</div>
    `;

    sliderElement.appendChild(reviewCard);
  });
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let starsHTML = "";

  // Thêm sao đầy
  for (let i = 0; i < fullStars; i++) {
    starsHTML += "★";
  }

  // Thêm nửa sao nếu có
  if (halfStar) {
    starsHTML += "✮";
  }

  // Thêm sao trống
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += "☆";
  }

  return starsHTML;
}

function setupSlider(totalReviews) {
  const slider = document.querySelector("#reviews-slider");
  const prevBtn = document.querySelector("#prev-review");
  const nextBtn = document.querySelector("#next-review");

  let currentIndex = 0;
  const reviewCards = document.querySelectorAll(".review-card");
  const visibleItems = getVisibleItems();
  const maxIndex = Math.max(0, reviewCards.length - visibleItems);

  // Ẩn nút prev khi ở slide đầu tiên
  prevBtn.style.display = "none";

  // Ẩn cả hai nút nếu không đủ đánh giá để trượt
  if (reviewCards.length <= visibleItems) {
    nextBtn.style.display = "none";
  }

  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSliderPosition();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateSliderPosition();
    }
  });

  function updateSliderPosition() {
    const itemWidth = reviewCards[0].offsetWidth + 20; // Bao gồm cả gap
    slider.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

    // Cập nhật trạng thái nút
    prevBtn.style.display = currentIndex === 0 ? "none" : "flex";
    nextBtn.style.display = currentIndex >= maxIndex ? "none" : "flex";
  }

  // Xác định số lượng đánh giá hiển thị dựa theo kích thước màn hình
  function getVisibleItems() {
    const width = window.innerWidth;
    if (width < 576) return 1;
    if (width < 992) return 2;
    return 3;
  }

  // Cập nhật lại khi thay đổi kích thước màn hình
  window.addEventListener("resize", () => {
    const newVisibleItems = getVisibleItems();
    const newMaxIndex = Math.max(0, reviewCards.length - newVisibleItems);

    // Điều chỉnh vị trí nếu cần
    if (currentIndex > newMaxIndex) {
      currentIndex = newMaxIndex;
    }

    updateSliderPosition();
  });
}

// Thêm cài đặt trực tiếp MaSanPham nếu cần test
function setTestProductId(productId) {
  console.log("Đang cài đặt mã sản phẩm test:", productId);
  fetchReviews(productId);
}
