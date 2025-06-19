document.addEventListener("DOMContentLoaded", function () {
  hienThiGioHang();
  taiThongTinNhanHang();
});

/* HIỂN THỊ GIỎ HÀNG */
function hienThiGioHang() {
  let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
  const cartItems = document.getElementById("cartItems");
  const tongTienElement = document.getElementById("tongTien");

  cartItems.innerHTML = "";
  let tongTien = 0;

  if (gioHang.length === 0) {
    cartItems.innerHTML = "<tr><td colspan='6'>Giỏ hàng trống</td></tr>";
    tongTienElement.textContent = "0";
    return;
  }

  gioHang.forEach((sp, index) => {
    let giaBan = parseFloat(sp.giaBan) || 0;
    let thanhTien = giaBan * sp.soLuong;
    tongTien += thanhTien;

    cartItems.innerHTML += `
  <tr>
  <td>${sp.tenSanPham}</td>
  <td>${giaBan.toLocaleString()} VNĐ</td>
  <td>
    <div class="quantity-control">
      <button class="quantity-btn" onclick="giamSoLuong(${index})" ${
      sp.soLuong === 1 ? "disabled" : ""
    }>-</button>
      <input type="number" class="quantity-input" value="${
        sp.soLuong
      }" min="1" readonly>
      <button class="quantity-btn" onclick="tangSoLuong(${index})">+</button>
    </div>
  </td>
  <td>${thanhTien.toLocaleString()} VNĐ</td>
  <td><button class="remove-btn" onclick="xoaSanPham(${index})">Xóa</button></td>
</tr>
`;
  });

  tongTienElement.textContent = tongTien.toLocaleString();
}

/* CHỈNH SỬA SỐ LƯỢNG SẢN PHẨM */
function tangSoLuong(index) {
  let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
  gioHang[index].soLuong++;
  localStorage.setItem("gioHang", JSON.stringify(gioHang));
  hienThiGioHang();
}

function giamSoLuong(index) {
  let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
  if (gioHang[index].soLuong > 1) {
    gioHang[index].soLuong--;
  } else {
    xoaSanPham(index);
    return;
  }
  localStorage.setItem("gioHang", JSON.stringify(gioHang));
  hienThiGioHang();
}

function xoaSanPham(index) {
  if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
    let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
    gioHang.splice(index, 1);
    localStorage.setItem("gioHang", JSON.stringify(gioHang));
    hienThiGioHang();
  }
}

/* LƯU & TẢI THÔNG TIN NHẬN HÀNG */
function luuThongTinNhanHang() {
  const soDienThoai = document.getElementById("soDienThoai").value.trim();
  const diaChi = document.getElementById("diaChi").value.trim();
  const phuongThucThanhToan = document.getElementById(
    "phuongThucThanhToan"
  ).value;

  const thongTinNhanHang = { soDienThoai, diaChi, phuongThucThanhToan };
  localStorage.setItem("thongTinNhanHang", JSON.stringify(thongTinNhanHang));
}

function taiThongTinNhanHang() {
  const thongTinNhanHang = JSON.parse(localStorage.getItem("thongTinNhanHang"));

  if (thongTinNhanHang) {
    document.getElementById("soDienThoai").value =
      thongTinNhanHang.soDienThoai || "";
    document.getElementById("diaChi").value = thongTinNhanHang.diaChi || "";
    document.getElementById("phuongThucThanhToan").value =
      thongTinNhanHang.phuongThucThanhToan || "Khi nhận";
  }
}

/* THANH TOÁN ĐƠN HÀNG */
async function thanhToan() {
  let vaiTro = localStorage.getItem("userRole");
  let token = localStorage.getItem("authToken");

  if (vaiTro !== "KhachHang") {
    alert("Bạn cần đăng nhập trước khi thanh toán!");
    window.location.href = "account.html";
    return;
  }

  let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
  if (gioHang.length === 0) {
    alert("Giỏ hàng của bạn đang trống!");
    return;
  }

  // Lưu thông tin nhận hàng trước khi gửi
  luuThongTinNhanHang();
  const thongTinNhanHang = JSON.parse(localStorage.getItem("thongTinNhanHang"));

  if (!thongTinNhanHang.soDienThoai || !thongTinNhanHang.diaChi) {
    alert("Vui lòng nhập đầy đủ thông tin nhận hàng!");
    return;
  }

  // Tạo dữ liệu gửi lên API
  const donHangData = {
    DiaChiGiaoHang: thongTinNhanHang.diaChi,
    SoDienThoai: thongTinNhanHang.soDienThoai,
    ChiTietDonHangs: gioHang.map((sp) => ({
      MaSanPham: sp.maSanPham.toUpperCase(), // Chuyển mã sản phẩm thành chữ hoa
      SoLuong: sp.soLuong,
      GiaBan: sp.giaBan,
    })),
  };

  try {
    const response = await fetch(
      "http://localhost:5258/api/DonHang/ThemDonHang",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(donHangData),
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("Đơn hàng của bạn đã được đặt thành công!");

      // Xóa giỏ hàng và tự load lại trang
      localStorage.removeItem("gioHang");
      localStorage.removeItem("thongTinNhanHang");
      location.reload();
    } else {
      alert(`Lỗi đặt hàng: ${result.Message || "Không thể đặt hàng"}`);
    }
  } catch (error) {
    alert("Lỗi kết nối đến server, vui lòng thử lại sau.");
    console.error("Lỗi:", error);
  }
}
