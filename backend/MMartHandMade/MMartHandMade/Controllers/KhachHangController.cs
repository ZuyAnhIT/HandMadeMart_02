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
    public class KhachHangController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public KhachHangController(MartHandMadeContext context)
        {
            DBC = context;
        }

        // API lấy thông tin cá nhân khách hàng 
        [HttpGet("LayCaNhanKhachHang")]
        [Authorize(Roles = "KhachHang")]
        public IActionResult GetCaNhan()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Tìm tài khoản có MaTaiKhoan khớp với userId
            var taiKhoan = DBC.TaiKhoans.FirstOrDefault(tk => tk.MaTaiKhoan.ToString() == userId);

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản với userId.", UserID = userId });

            // Dùng MaKhachHang của tài khoản để tìm thông tin 
            var khachhang = DBC.KhachHangs
                .Include(q => q.TaiKhoans) // Nếu cần lấy danh sách tài khoản liên kết
                .FirstOrDefault(q => q.MaKhachHang == taiKhoan.MaKhachHang);

            if (khachhang == null)
                return NotFound(new { Message = "Không tìm thấy thông tin khach hang.", MaTaiKhoan = userId });

            return Ok(khachhang);
        }

        // API lấy danh sách khách hàng
        [Authorize(Roles = "QuanLy,NhanVien")]
        [HttpGet("LayKhachHang")]
        public IActionResult GetKhachHang()
        {
            return Ok(new { data = DBC.KhachHangs.ToList() });
        }

        // API cap nhat khachhang
        [HttpPut("CapNhat")]
        [Authorize(Roles = "KhachHang")]
        public IActionResult UpdateQuanLy([FromForm] KhachHangUpdateDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Lấy tài khoản từ userId
            var taiKhoan = DBC.TaiKhoans.FirstOrDefault(tk => tk.MaTaiKhoan.ToString() == userId);
            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản với userId.", UserID = userId });

            // Lấy thông tin 
            var khachhang = DBC.KhachHangs.FirstOrDefault(q => q.MaKhachHang == taiKhoan.MaKhachHang);
            if (khachhang == null)
                return NotFound(new { Message = "Không tìm thấy thông tin khach hang.", MaTaiKhoan = userId });

            // Chỉ cập nhật các trường có giá trị mới, giữ nguyên nếu null hoặc rỗng
            if (!string.IsNullOrWhiteSpace(model.HoTenKhachHang))
                khachhang.HoTenKhachHang = model.HoTenKhachHang;

            if (!string.IsNullOrWhiteSpace(model.DiaChiKhach))
                khachhang.DiaChiKhach = model.DiaChiKhach;

            if (!string.IsNullOrWhiteSpace(model.EmailKhach))
                khachhang.EmailKhach = model.EmailKhach;

            if (!string.IsNullOrWhiteSpace(model.SoDienThoaiKhach))
                khachhang.SoDienThoaiKhach = model.SoDienThoaiKhach;
            // Lưu thay đổi vào database
            DBC.SaveChanges();

            return Ok(new { Message = "Cập nhật thành công", UpdatedData = khachhang });
        }
        public class KhachHangUpdateDto
        {
            public string HoTenKhachHang { get; set; } = null!;
            public string DiaChiKhach { get; set; } = null!;
            public string EmailKhach { get; set; } = null!;
            public string SoDienThoaiKhach { get; set; } = null!;
        }
    }

}
