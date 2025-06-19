// Hàm tải danh sách yêu cầu hỗ trợ
async function loadSupports() {
  const tableBody = document.querySelector("#support-table tbody");
  tableBody.innerHTML = ""; // Xóa nội dung bảng cũ

  try {
    const response = await fetch(
      "http://localhost:5258/api/HoTro/DanhSachHoTro",
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      }
    );

    if (!response.ok) throw new Error("Không thể tải dữ liệu yêu cầu hỗ trợ.");

    const data = await response.json();

    // Kiểm tra dữ liệu có hợp lệ hay không
    if (
      data &&
      data.$values &&
      Array.isArray(data.$values) &&
      data.$values.length > 0
    ) {
      data.$values.forEach((hoTro, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${hoTro.tenKhachHang}</td>
                <td>${hoTro.soDienThoai}</td>
                <td>${hoTro.email}</td>
                <td>${hoTro.noiDung}</td>
                <td id="status-${hoTro.maLienHe}">
                  <span>${hoTro.trangThai}</span>
                  <select id="status-select-${
                    hoTro.maLienHe
                  }" class="status-select" style="display: none;">
                    <option value="Chưa liên hệ" ${
                      hoTro.trangThai === "Chưa liên hệ" ? "selected" : ""
                    }>Chưa liên hệ</option>
                    <option value="Đang liên hệ" ${
                      hoTro.trangThai === "Đang liên hệ" ? "selected" : ""
                    }>Đang liên hệ</option>
                    <option value="Đã liên hệ" ${
                      hoTro.trangThai === "Đã liên hệ" ? "selected" : ""
                    }>Đã liên hệ</option>
                  </select>
                </td>
                <td>${hoTro.tenNhanVien || "Chưa có nhân viên hỗ trợ"}</td>
                <td>
                  <button onclick="toggleStatusEdit('${
                    hoTro.maLienHe
                  }')">Cập nhật trạng thái</button>
                  <button onclick="deleteSupportRequest('${
                    hoTro.maLienHe
                  }')">Xoá</button>
                </td>
              `;
        tableBody.appendChild(tr);
      });
    } else {
      throw new Error("Dữ liệu không đúng định dạng.");
    }
  } catch (err) {
    console.error(err);
    alert("Đã xảy ra lỗi khi tải danh sách yêu cầu hỗ trợ.");
  }
}

// Hàm toggle để hiển thị dropdown chỉnh sửa trạng thái
function toggleStatusEdit(maLienHe) {
  const statusText = document.querySelector(`#status-${maLienHe} span`);
  const statusSelect = document.querySelector(`#status-select-${maLienHe}`);

  // Chuyển giữa trạng thái hiển thị văn bản và dropdown
  if (statusSelect.style.display === "none") {
    statusText.style.display = "none";
    statusSelect.style.display = "inline";
  } else {
    statusText.style.display = "inline";
    statusSelect.style.display = "none";
    // Nếu người dùng đã thay đổi trạng thái, gọi hàm cập nhật
    const newStatus = statusSelect.value;
    if (newStatus !== statusText.textContent) {
      updateStatus(maLienHe, newStatus);
    }
  }
}

// Hàm cập nhật trạng thái yêu cầu hỗ trợ
async function updateStatus(maLienHe, newStatus) {
  try {
    const response = await fetch(
      `http://localhost:5258/api/HoTro/CapNhatTrangThai/${maLienHe}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
          "Content-Type": "application/x-www-form-urlencoded", // Content type cần phù hợp với yêu cầu API
        },
        body: new URLSearchParams({ trangThaiMoi: newStatus }).toString(), // Cập nhật trạng thái qua FormData
      }
    );

    if (!response.ok) throw new Error("Cập nhật trạng thái yêu cầu thất bại");

    alert("Cập nhật trạng thái thành công!");

    // Cập nhật trực tiếp trên giao diện
    const statusText = document.querySelector(`#status-${maLienHe} span`);
    statusText.textContent = newStatus;
  } catch (err) {
    console.error(err);
    alert("Lỗi khi cập nhật trạng thái.");
  }
}

// Hàm xóa yêu cầu hỗ trợ
async function deleteSupportRequest(maLienHe) {
  if (!confirm("Bạn có chắc muốn xoá yêu cầu này?")) return;

  try {
    const response = await fetch(
      `http://localhost:5258/api/HoTro/Xoa/${maLienHe}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("authToken"),
        },
      }
    );

    if (!response.ok) throw new Error("Xoá yêu cầu thất bại");

    alert("Đã xoá yêu cầu thành công!");
    loadSupportRequests(); // Refresh lại bảng
  } catch (err) {
    console.error(err);
    alert("Lỗi khi xoá yêu cầu.");
  }
}

// Hàm này được gọi khi trang được tải
document.addEventListener("DOMContentLoaded", function () {
  const supportPage = document.getElementById("support-management-page");
  if (!supportPage.classList.contains("hidden")) {
    loadSupports(); // Gọi hàm loadSupportRequests khi trang được hiển thị
  }
});
