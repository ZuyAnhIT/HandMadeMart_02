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
    public class QuanLyController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public QuanLyController(MartHandMadeContext context)
        {
            DBC = context;
        }

        // API lấy thông tin quản lý 
        [HttpGet("ThongTinQuanLy")]
        [Authorize(Roles = "QuanLy")]
        public IActionResult GetQuanLy()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Tìm tài khoản có MaTaiKhoan khớp với userId
            var taiKhoan = DBC.TaiKhoans.FirstOrDefault(tk => tk.MaTaiKhoan.ToString() == userId);

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản với userId.", UserID = userId });

            // Dùng MaQuanLy của tài khoản để tìm thông tin quản lý
            var quanLy = DBC.QuanLies
                .Include(q => q.TaiKhoans) // Nếu cần lấy danh sách tài khoản liên kết
                .FirstOrDefault(q => q.MaQuanLy == taiKhoan.MaQuanLy);

            if (quanLy == null)
                return NotFound(new { Message = "Không tìm thấy thông tin quản lý.", MaTaiKhoan = userId });

            return Ok(quanLy);
        }

        // API cập nhật quản lý 
        [HttpPut("CapNhat")]
        [Authorize(Roles = "QuanLy")]
        public IActionResult UpdateQuanLy([FromForm] QuanLyUpdateDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Lấy tài khoản từ userId
            var taiKhoan = DBC.TaiKhoans.FirstOrDefault(tk => tk.MaTaiKhoan.ToString() == userId);
            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản với userId.", UserID = userId });

            // Lấy thông tin quản lý
            var quanLy = DBC.QuanLies.FirstOrDefault(q => q.MaQuanLy == taiKhoan.MaQuanLy);
            if (quanLy == null)
                return NotFound(new { Message = "Không tìm thấy thông tin quản lý.", MaTaiKhoan = userId });

            // Cập nhật họ tên quản lý
            if (string.IsNullOrWhiteSpace(model.HoTen))
                return BadRequest("Họ tên không được để trống.");

            quanLy.HoTenQuanLy = model.HoTen;

            // Lưu thay đổi vào database
            DBC.SaveChanges();

            return Ok(new { Message = "Cập nhật thành công", UpdatedData = quanLy });
        }
        public class QuanLyUpdateDto
        {
            public required string HoTen { get; set; }
        }


    }
}
