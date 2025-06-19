using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MMartHandMade.Models;
using System.Text;


namespace MMartHandMade.Controllers
{
    [Route("api/taiKhoan")]
    [ApiController]
    public class DangKyController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public DangKyController(MartHandMadeContext context)
        {
            DBC = context;
        }
        // API Dang ky
        [HttpPost("dangKy")]
        public IActionResult DangKy([FromForm] DangKyModel model)
        {
            // Kiem tra mot so dieu kien
            if (DBC.TaiKhoans.Any(t => t.TenDangNhap == model.TenDangNhap))
            {
                return BadRequest("Tên đăng nhập đã tồn tại.");
            }
            if (DBC.KhachHangs.Any(k => k.EmailKhach == model.Email || k.SoDienThoaiKhach == model.SoDienThoai))
            {
                return BadRequest("Email hoặc số điện thoại đã tồn tại.");
            }
            if (model.MatKhau != model.NhapLaiMatKhau)
            {
                return BadRequest("Mật khẩu nhập lại không khớp.");
            }


            var maKhachHang = Guid.NewGuid();
            var khachHang = new KhachHang
            {
                MaKhachHang = maKhachHang,
                HoTenKhachHang = model.HoTen,
                DiaChiKhach = model.DiaChi,
                EmailKhach = model.Email,
                SoDienThoaiKhach = model.SoDienThoai,
            };
            DBC.KhachHangs.Add(khachHang);


            var taiKhoan = new TaiKhoan
            {
                MaTaiKhoan = Guid.NewGuid(),
                TenDangNhap = model.TenDangNhap,
                HashMatKhau = HashPassword(model.MatKhau),
                VaiTro = "KhachHang",
                TrangThaiTaiKhoan = "Hoạt động",
                MaKhachHang = maKhachHang
            };
            DBC.TaiKhoans.Add(taiKhoan);

            DBC.SaveChanges();

            return Ok("Đăng ký thành công.");
        }

        // Ma hoa mat khau
        private string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }

    // Tao lop dang ky
    public class DangKyModel
    {
        public required string Email { get; set; }
        public required string SoDienThoai { get; set; }
        public required string HoTen { get; set; }
        public required string DiaChi { get; set; }
        public required string TenDangNhap { get; set; }
        public required string MatKhau { get; set; }
        public required string NhapLaiMatKhau { get; set; }
    }

}
