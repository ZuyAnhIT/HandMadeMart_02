// Khởi tạo các biến lưu trữ dữ liệu
let categories = [];
let products = [];
let orders = [];
let staffAccounts = [];
let customerAccounts = [];
let staffInfo = [];
let customerInfo = [];
let reviews = []; // Biến lưu trữ dữ liệu đánh giá
let selectedItemId = null;
let currentPage = "dashboard";
let currentSubpage = null;
let chartPeriod = "month";
let filterRating = 0; // 0 = Tất cả, 1-5 = Số sao tương ứng
let sortOption = "newest"; // newest, oldest, highest, lowest

// Chức năng khởi tạo
document.addEventListener("DOMContentLoaded", function () {
  // Thiết lập sự kiện cho menu
  setupMenuEvents();
});

// Thiết lập sự kiện cho menu
function setupMenuEvents() {
  // Sự kiện hiển thị/ẩn submenu
  const menuItems = document.querySelectorAll(".menu li");
  menuItems.forEach((item) => {
    const submenu = item.querySelector(".submenu");
    if (submenu) {
      item.addEventListener("click", function (e) {
        if (e.target.tagName !== "LI" || e.target.closest(".submenu")) return;

        item.classList.toggle("open");

        // Đóng các submenu khác
        menuItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains("open")) {
            otherItem.classList.remove("open");
          }
        });
      });
    }
  });

  // Sự kiện chuyển trang khi click vào menu item
  document.querySelectorAll(".menu li[data-page]").forEach((item) => {
    item.addEventListener("click", function (e) {
      if (e.target.closest(".submenu")) return;

      const page = this.getAttribute("data-page");
      navigateTo(page);
    });
  });

  // Sự kiện chuyển trang khi click vào submenu item
  document.querySelectorAll(".submenu li[data-subpage]").forEach((item) => {
    item.addEventListener("click", function () {
      const parentPage = this.closest("[data-page]").getAttribute("data-page");
      const subpage = this.getAttribute("data-subpage");
      navigateToSubpage(parentPage, subpage);
    });
  });

  // Sự kiện đăng xuất
  document.querySelector(".logout").addEventListener("click", function () {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      // Gọi API đăng xuất
      logout();
    }
  });

  // Sự kiện thay đổi chu kỳ biểu đồ
  document
    .querySelectorAll(".dropdown-content a[data-period]")
    .forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        const period = this.getAttribute("data-period");
        chartPeriod = period;

        // Xóa trạng thái active của tất cả các liên kết
        document
          .querySelectorAll(".dropdown-content a[data-period]")
          .forEach((link) => {
            link.classList.remove("active");
          });

        // Đánh dấu liên kết được chọn
        this.classList.add("active");

        // Cập nhật biểu đồ
        updateDashboardCharts();
      });
    });
}

// Điều hướng đến trang chính
function navigateTo(page) {
  // Loại bỏ active class từ tất cả menu items
  document.querySelectorAll(".menu li").forEach((item) => {
    item.classList.remove("active");
  });

  // Thêm active class vào menu item được chọn
  document
    .querySelector(`.menu li[data-page="${page}"]`)
    .classList.add("active");

  // Ẩn tất cả các trang
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  currentPage = page;
  currentSubpage = null;

  // Hiển thị trang tương ứng
  if (page === "dashboard") {
    document.getElementById("dashboard-page").classList.remove("hidden");
    updateDashboardCharts();
  } else if (page === "category-management") {
    document
      .getElementById("category-management-page")
      .classList.remove("hidden");
    loadCategories();
  } else if (page === "product-management") {
    document
      .getElementById("product-management-page")
      .classList.remove("hidden");
    loadProducts();
  } else if (page === "order-management") {
    document.getElementById("order-management-page").classList.remove("hidden");
    loadOrders();
  } else if (page === "review-management") {
    document
      .getElementById("review-management-page")
      .classList.remove("hidden");
    loadReview(); // Gọi hàm tải đánh giá
  } else if (page === "support-management") {
  document
    .getElementById("support-management-page")
    .classList.remove("hidden");
  loadSupports(); // Gọi hàm tải dữ liệu hỗ trợ
  }
}


// Điều hướng đến trang con
function navigateToSubpage(parentPage, subpage) {
  // Loại bỏ active class từ tất cả menu items
  document.querySelectorAll(".menu li").forEach((item) => {
    item.classList.remove("active");
  });

  // Thêm active class vào menu item được chọn
  document
    .querySelector(`.menu li[data-page="${parentPage}"]`)
    .classList.add("active");

  // Ẩn tất cả các trang
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  currentPage = parentPage;
  currentSubpage = subpage;

  // Hiển thị trang con tương ứng
  if (parentPage === "account-management") {
    if (subpage === "personal-account") {
      document
        .getElementById("personal-account-page")
        .classList.remove("hidden");
    } else if (subpage === "staff-account") {
      document.getElementById("staff-account-page").classList.remove("hidden");
      loadStaffAccounts();
    } else if (subpage === "customer-account") {
      document
        .getElementById("customer-account-page")
        .classList.remove("hidden");
      loadCustomerAccounts();
    }
  } else if (parentPage === "customer-management") {
    if (subpage === "staff-info") {
      document.getElementById("staff-info-page").classList.remove("hidden");
    } else if (subpage === "customer-info") {
      document.getElementById("customer-info-page").classList.remove("hidden");
    }
  }
}
