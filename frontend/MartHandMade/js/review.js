async function loadReview() {
  const tableBody = document.querySelector("#review-table tbody");
  tableBody.innerHTML = "";

  try {
    const response = await fetch(
      "http://localhost:5258/api/danhgia/Danhsachdanhgia",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      }
    );

    if (!response.ok) throw new Error("Không thể tải dữ liệu đánh giá.");

    const data = await response.json();

    // Kiểm tra dữ liệu có chứa trường $values hay không
    if (data && data.$values) {
      data.$values.forEach((dg, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
              <td>${index + 1}</td>
              <td>${dg.tenSanPham}</td>
              <td>${dg.tenKhachHang}</td>
              <td>${dg.soSao} ⭐</td>
              <td>${dg.binhLuan}</td>
              <td>${new Date(dg.ngayDanhGia).toLocaleDateString()}</td>
              <td>
                <button onclick="xoaDanhGia('${dg.maDanhGia}')">Xoá</button>
              </td>
            `;
        tableBody.appendChild(tr);
      });
    } else {
      throw new Error("Dữ liệu không đúng định dạng.");
    }
  } catch (err) {
    console.error(err);
    alert("Đã xảy ra lỗi khi tải danh sách đánh giá.");
  }
}

async function xoaDanhGia(maDanhGia) {
  if (!confirm("Bạn có chắc muốn xoá đánh giá này?")) return;

  try {
    const response = await fetch(
      `http://localhost:5258/api/danhgia/Xoa/${maDanhGia}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      }
    );

    if (!response.ok) throw new Error("Xoá đánh giá thất bại");

    alert("Đã xoá thành công!");
    loadReview(); // Refresh lại bảng
  } catch (err) {
    console.error(err);
    alert("Lỗi khi xoá đánh giá.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const reviewPage = document.getElementById("review-management-page");
  if (!reviewPage.classList.contains("hidden")) {
    loadReview(); // Gọi hàm loadReview khi trang được hiển thị
  }
});
