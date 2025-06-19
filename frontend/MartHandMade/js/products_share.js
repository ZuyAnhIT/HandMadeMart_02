document.addEventListener("DOMContentLoaded", function () {
    // Lấy thông tin tìm kiếm từ localStorage
    let searchResults;
    try {
      const rawResults = localStorage.getItem("searchResults");
      searchResults = rawResults ? JSON.parse(rawResults) : [];
  
      // Đảm bảo searchResults là một mảng
      if (!Array.isArray(searchResults)) {
        // Kiểm tra cấu trúc API mới với thuộc tính $values
        if (searchResults && typeof searchResults === "object") {
          if (searchResults.$values && Array.isArray(searchResults.$values)) {
            // Trường hợp API mới trả về mảng trong $values
            searchResults = searchResults.$values;
          } else if (Array.isArray(searchResults.data)) {
            searchResults = searchResults.data;
          } else if (Array.isArray(searchResults.products)) {
            searchResults = searchResults.products;
          } else if (Array.isArray(searchResults.items)) {
            searchResults = searchResults.items;
          } else if (Array.isArray(searchResults.results)) {
            searchResults = searchResults.results;
          } else {
            // Nếu không tìm thấy mảng, chuyển đối tượng thành mảng chứa đối tượng đó
            searchResults = [searchResults];
          }
        } else {
          // Nếu không phải đối tượng, khởi tạo mảng rỗng
          searchResults = [];
          console.error("Dữ liệu tìm kiếm không hợp lệ");
        }
      }
    } catch (error) {
      console.error("Lỗi khi phân tích dữ liệu tìm kiếm:", error);
      searchResults = [];
    }
  
    const keyword = localStorage.getItem("searchKeyword") || "";
    const timestamp = new Date(
      localStorage.getItem("searchTimestamp") || new Date()
    );
  
    // Cập nhật tiêu đề tìm kiếm
    document.getElementById(
      "search-title"
    ).textContent = `Kết quả tìm kiếm cho "${keyword}"`;
  
    // Cập nhật mô tả tìm kiếm
    document.getElementById(
      "search-description"
    ).textContent = `Danh sách sản phẩm theo tìm kiếm của bạn với từ khóa "${keyword}"`;
  
    // Hiển thị số lượng kết quả tìm kiếm
    document.getElementById("search-count").textContent = `Tìm thấy ${
      searchResults.length
    } sản phẩm (${formatSearchTime(timestamp)})`;
  
    // Kiểm tra nếu không có kết quả
    if (!searchResults || searchResults.length === 0) {
      renderNoResults(keyword);
      return;
    }
  
    // Hiển thị kết quả tìm kiếm sử dụng cách hiển thị mới
    renderSanPham("searchResults", searchResults);
  
    // Khởi tạo số lượng sản phẩm trong giỏ hàng
    updateCartCount();
  });
  
  // Định dạng thời gian tìm kiếm
  function formatSearchTime(timestamp) {
    const searchTime = new Date(timestamp);
    const hours = searchTime.getHours().toString().padStart(2, "0");
    const minutes = searchTime.getMinutes().toString().padStart(2, "0");
    const day = searchTime.getDate();
    const month = searchTime.getMonth() + 1;
    const year = searchTime.getFullYear();
  
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }
  
  // Hiển thị khi không có kết quả
  function renderNoResults(keyword) {
    const searchResults = document.getElementById("searchResults");
    const noResultsElement = document.createElement("div");
    noResultsElement.className = "no-results";
  
    noResultsElement.innerHTML = `
          <i class="fas fa-search"></i>
          <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "${keyword}"</p>
          <p>Vui lòng thử lại với từ khóa khác</p>
      `;
  
    searchResults.appendChild(noResultsElement);
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
      // Truy cập an toàn các thuộc tính
      const maSanPham = sp.maSanPham || sp.ma || sp.id || "";
      const tenSanPham = sp.tenSanPham || sp.ten || sp.name || "Sản phẩm không có tên";
      const giaBan = sp.giaBan || sp.gia || sp.price || 0;
      const soLuongBan = sp.soLuongBan || sp.daBan || 0;
      const anhSanPham = sp.anhSanPham || "assets/images/default-product.jpg";
  
      html += `
      <div class="san-pham" onmouseenter="hienGioHang(this)" onmouseleave="anGioHang(this)" onclick="chiTietSanPham('${maSanPham}')">
          <img src="${anhSanPham}" alt="${tenSanPham}" onerror="this.src='assets/images/default-product.jpg'" />
          <h3>${tenSanPham}</h3>
          <p>Đã Bán: ${soLuongBan}</p>
          <p><strong>Giá: ${formatCurrency(giaBan)}</strong></p>
          <div class="cart-overlay">
              <button onclick="themVaoGioHang(event, '${maSanPham}', '${tenSanPham.replace(/'/g, "\\'")}', ${giaBan})">
                  <i class="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
              </button>
          </div>
      </div>`;
    });
  
    container.innerHTML = html;
  }
  
  // Định dạng tiền tệ
  function formatCurrency(amount) {
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    } catch (error) {
      console.warn("Lỗi định dạng tiền tệ:", error);
      return amount.toLocaleString() + " VND";
    }
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