document.addEventListener("DOMContentLoaded", function () {
  const viewLargerMapLink = document.querySelector(".view-reviews");
  if (viewLargerMapLink) {
    viewLargerMapLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.open(
        "https://www.google.com/maps/place/372B+P.+Xã+Đàn,+Nam+Đồng,+Đống+Đa,+Hà+Nội,+Vietnam",
        "_blank"
      );
    });
  }
});
// Xử lý form liên hệ
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Lấy dữ liệu từ form
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const content = document.getElementById("content").value.trim();

      // Kiểm tra dữ liệu
      if (!name || !phone || !email || !content) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      // Gửi dữ liệu
      const formData = new FormData();
      formData.append("tenKhachHang", name);
      formData.append("soDienThoai", phone);
      formData.append("email", email);
      formData.append("noiDung", content);

      // Gọi API
      fetch("http://localhost:5258/api/HoTro/ThemHoTro", {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text || "Có lỗi xảy ra.");
            });
          }
          return response.json();
        })
        .then((data) => {
          alert("Yêu cầu hỗ trợ đã được gửi thành công!");
          contactForm.reset();
        })
        .catch((error) => {
          alert("Không thể gửi yêu cầu hỗ trợ: " + error.message);
          console.error("Lỗi gửi form:", error);
        });
    });
  }
});
