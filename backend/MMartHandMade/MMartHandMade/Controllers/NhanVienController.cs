using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MMartHandMade.Models;
using System.Security.Claims;


namespace MMartHandMade.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NhanVienController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public NhanVienController(MartHandMadeContext context)
        {
            DBC = context;
        }

        [HttpGet("LayCaNhanNhanVien")]
        [Authorize(Roles = "NhanVien")]
        public IActionResult GetCaNhan()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Tìm tài khoản có MaTaiKhoan khớp với userId
            var taiKhoan = DBC.TaiKhoans.FirstOrDefault(tk => tk.MaTaiKhoan.ToString() == userId);

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản với userId.", UserID = userId });

            // Dùng MaNhanVien của tài khoản để tìm thông tin 
            var nhanvien = DBC.NhanViens
                .Include(q => q.TaiKhoans) // Nếu cần lấy danh sách tài khoản liên kết
                .FirstOrDefault(q => q.MaNhanVien == taiKhoan.MaNhanVien);

            if (nhanvien == null)
                return NotFound(new { Message = "Không tìm thấy thông tin nhan vien.", MaTaiKhoan = userId });

            return Ok(nhanvien);
        }

        // API lấy danh sách nhân viên 
        [Authorize(Roles = "QuanLy")]
        [HttpGet("LayNhanVien")]
        public IActionResult GetNhanVien()
        {
            return Ok(new { data = DBC.NhanViens.ToList() });
        }

        // API Them nhan vien
        [HttpPost("ThemNhanVien")]
        [Authorize(Roles = "QuanLy")]
        public IActionResult AddNhanVien([FromForm] NhanVienDto nhanVienDto)
        {
            // Kiểm tra Email đã tồn tại chưa
            if (DBC.NhanViens.Any(nv => nv.EmailNhanVien == nhanVienDto.EmailNhanVien))
                return BadRequest("Email đã tồn tại");

            // Kiểm tra Số điện thoại đã tồn tại chưa
            if (DBC.NhanViens.Any(nv => nv.SoDienThoaiNhanVien == nhanVienDto.SoDienThoaiNhanVien))
                return BadRequest("Số điện thoại đã tồn tại");

            var nhanVien = new NhanVien
            {
                MaNhanVien = Guid.NewGuid(),
                HoTenNhanVien = nhanVienDto.HoTenNhanVien,
                DiaChiNhanVien = nhanVienDto.DiaChiNhanVien,
                EmailNhanVien = nhanVienDto.EmailNhanVien,
                SoDienThoaiNhanVien = nhanVienDto.SoDienThoaiNhanVien,
            };

            DBC.NhanViens.Add(nhanVien);
            DBC.SaveChanges();

            return Ok(new { message = "Thêm nhân viên thành công!", data = nhanVien });
        }

        // API cap nhat ca nhan nhan vien
        [HttpPut("CapNhatCaNhan")]
        [Authorize(Roles = "NhanVien")]
        public IActionResult UpdateQuanLy([FromForm] NhanVienDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Lấy tài khoản từ userId
            var taiKhoan = DBC.TaiKhoans.FirstOrDefault(tk => tk.MaTaiKhoan.ToString() == userId);
            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản với userId.", UserID = userId });

            // Lấy thông tin 
            var nhanvien = DBC.NhanViens.FirstOrDefault(q => q.MaNhanVien == taiKhoan.MaNhanVien);
            if (nhanvien == null)
                return NotFound(new { Message = "Không tìm thấy thông tin khach hang.", MaTaiKhoan = userId });

            // Chỉ cập nhật các trường có giá trị mới, giữ nguyên nếu null hoặc rỗng
            if (!string.IsNullOrWhiteSpace(model.HoTenNhanVien))
                nhanvien.HoTenNhanVien = model.HoTenNhanVien;

            if (!string.IsNullOrWhiteSpace(model.DiaChiNhanVien))
                nhanvien.DiaChiNhanVien = model.DiaChiNhanVien;

            if (!string.IsNullOrWhiteSpace(model.EmailNhanVien))
                nhanvien.EmailNhanVien = model.EmailNhanVien;

            if (!string.IsNullOrWhiteSpace(model.SoDienThoaiNhanVien))
                nhanvien.SoDienThoaiNhanVien = model.SoDienThoaiNhanVien;
            // Lưu thay đổi vào database
            DBC.SaveChanges();

            return Ok(new { Message = "Cập nhật thành công", UpdatedData = nhanvien });
        }

        [HttpPut("CapNhat/{maNhanVien}")]
        [Authorize(Roles = "QuanLy")]
        public IActionResult UpdateNhanVien(Guid maNhanVien, [FromForm] NhanVienDto model)
        {

            var nhanVien = DBC.NhanViens.Find(maNhanVien);
            if (nhanVien == null)
                return NotFound(new { message = "Nhân viên không tồn tại" });

            // Cập nhật thông tin, không thay đổi trạng thái
            nhanVien.HoTenNhanVien = model.HoTenNhanVien;
            nhanVien.DiaChiNhanVien = model.DiaChiNhanVien;
            nhanVien.EmailNhanVien = model.EmailNhanVien;
            nhanVien.SoDienThoaiNhanVien = model.SoDienThoaiNhanVien;

            DBC.NhanViens.Update(nhanVien);
            DBC.SaveChanges();

            return Ok(new { message = "Cập nhật thông tin thành công!", data = nhanVien });
        }


        public class NhanVienDto
        {
            public string HoTenNhanVien { get; set; } = null!;
            public string DiaChiNhanVien { get; set; } = null!;
            public string EmailNhanVien { get; set; } = null!;
            public string SoDienThoaiNhanVien { get; set; } = null!;
        }
    }
}
