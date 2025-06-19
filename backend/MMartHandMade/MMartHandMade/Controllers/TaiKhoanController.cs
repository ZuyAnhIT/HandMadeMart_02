using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System;
using MMartHandMade.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace MMartHandMade.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiKhoanController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public TaiKhoanController(MartHandMadeContext context)
        {
            DBC = context;
        }

        // API khach lay tai khoan ca nhan
        [HttpGet("LayTaiKhoanKhachHang")]
        public IActionResult GetKhachHangInfo()
        {
            // Lấy userId từ Token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Kiểm tra tài khoản có tồn tại không
            var taiKhoan = DBC.TaiKhoans
                .Where(tk => tk.MaTaiKhoan.ToString().ToUpper() == userId && tk.MaKhachHang != null)
                .Select(tk => new
                {
                    tk.MaTaiKhoan,
                    tk.TenDangNhap,
                    tk.HashMatKhau,
                    tk.VaiTro,
                    tk.TrangThaiTaiKhoan,
                    MaKhachHang = tk.MaKhachHang
                })
                .FirstOrDefault();

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản ." });

            return Ok(taiKhoan);
        }

        // API nhan vien lay tai khoan ca nhan
        [HttpGet("LayTaiKhoanNhanVien")]
        public IActionResult GetNhanVienInfo()
        {
            // Lấy userId từ Token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Kiểm tra tài khoản có tồn tại không
            var taiKhoan = DBC.TaiKhoans
                .Where(tk => tk.MaTaiKhoan.ToString().ToUpper() == userId && tk.MaNhanVien != null)
                .Select(tk => new
                {
                    tk.MaTaiKhoan,
                    tk.TenDangNhap,
                    tk.HashMatKhau,
                    tk.VaiTro,
                    tk.TrangThaiTaiKhoan,
                    MaNhanVien = tk.MaNhanVien,
                })
                .FirstOrDefault();

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản." });

            return Ok(taiKhoan);
        }

        // API quan ly lay tai khoan ca nhan
        [HttpGet("LayTaiKhoanQuanLy")]
        public IActionResult GetQuanLyInfo()
        {
            // Lấy userId từ Token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Kiểm tra tài khoản có tồn tại không
            var taiKhoan = DBC.TaiKhoans
                .Where(tk => tk.MaTaiKhoan.ToString().ToUpper() == userId && tk.MaQuanLy != null)
                .Select(tk => new
                {
                    tk.MaTaiKhoan,
                    tk.TenDangNhap,
                    tk.HashMatKhau,
                    tk.VaiTro,
                    tk.TrangThaiTaiKhoan,
                    MaQuanLy = tk.MaQuanLy
                })
                .FirstOrDefault();

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản." });

            return Ok(taiKhoan);
        }

        // API lấy danh sách tài khoản nhân viên
        [Authorize(Roles = "QuanLy")]
        [HttpGet("LayDanhSachTaiKhoanNhanVien")]
        public IActionResult GetTaiKhoanNhanVien()
        {
            var danhSachTaiKhoan = DBC.TaiKhoans
           .Where(tk => tk.MaNhanVien != null) // Chỉ lấy tài khoản nhân viên
           .Select(tk => new
           {
               tk.MaTaiKhoan,
               TenNhanVien = tk.MaNhanVienNavigation.HoTenNhanVien, // Lấy tên từ bảng NhanVien
               tk.TenDangNhap,
               tk.HashMatKhau,
               tk.VaiTro,
               tk.TrangThaiTaiKhoan,
               MaNhanVien = tk.MaNhanVien
           })
           .ToList();

            return Ok(danhSachTaiKhoan);
        }

        // API lấy danh sách tài khoản khách hàng
        [Authorize(Roles = "QuanLy")]
        [HttpGet("LayDanhSachTaiKhoanKhachHang")]
        public IActionResult GetTaiKhoanKhachHang()
        {
            var danhSachTaiKhoan = DBC.TaiKhoans
           .Where(tk => tk.MaKhachHang != null) // Chỉ lấy tài khoản khách hàng
           .Select(tk => new
           {
               tk.MaTaiKhoan,
               tk.TenDangNhap,
               TenKhachHang = tk.MaKhachHangNavigation.HoTenKhachHang,
               tk.HashMatKhau,
               tk.VaiTro,
               tk.TrangThaiTaiKhoan,
               MaKhachHang = tk.MaKhachHang
           })
           .ToList();

            return Ok(danhSachTaiKhoan);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        [HttpPost("ThemTaiKhoanNhanVien")]
       [Authorize(Roles = "QuanLy")]
        public IActionResult ThemNhanVien([FromForm] ThemNhanVienModel model)
        {
            // Kiểm tra nếu tên đăng nhập đã tồn tại
            if (DBC.TaiKhoans.Any(t => t.TenDangNhap == model.TenDangNhap))
            {
                return BadRequest("Tên đăng nhập đã tồn tại.");
            }

            // Kiểm tra nếu email hoặc số điện thoại đã tồn tại
            if (DBC.NhanViens.Any(nv => nv.EmailNhanVien == model.Email || nv.SoDienThoaiNhanVien == model.SoDienThoai))
            {
                return BadRequest("Email hoặc số điện thoại đã tồn tại.");
            }

            // Kiểm tra mật khẩu nhập lại có khớp không
            if (model.MatKhau != model.NhapLaiMatKhau)
            {
                return BadRequest("Mật khẩu nhập lại không khớp.");
            }

            // Tạo mã nhân viên mới
            var maNhanVien = Guid.NewGuid();

            // Tạo đối tượng Nhân Viên
            var nhanVien = new NhanVien
            {
                MaNhanVien = maNhanVien,
                HoTenNhanVien = model.HoTen,
                DiaChiNhanVien = model.DiaChi,
                EmailNhanVien = model.Email,
                SoDienThoaiNhanVien = model.SoDienThoai,
            };
            DBC.NhanViens.Add(nhanVien);

            // Tạo tài khoản cho nhân viên
            var taiKhoan = new TaiKhoan
            {
                MaTaiKhoan = Guid.NewGuid(),
                TenDangNhap = model.TenDangNhap,
                HashMatKhau = HashPassword(model.MatKhau), // Mã hóa mật khẩu
                VaiTro = "NhanVien", // Vai trò mặc định là Nhân Viên
                TrangThaiTaiKhoan = "Hoạt động",
                MaNhanVien = maNhanVien
            };
            DBC.TaiKhoans.Add(taiKhoan);

            // Lưu vào database
            DBC.SaveChanges();

            return Ok(new { Message = "Thêm nhân viên thành công.", NhanVien = nhanVien });
        }


        // API Cập nhật tài khoản
        [HttpPut("CapNhatTaiKhoan")]
        [Authorize(Roles = "QuanLy,NhanVien,KhachHang")]
        public IActionResult CapNhatTaiKhoan([FromForm] CapNhatTaiKhoanDTO model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Lấy tài khoản từ userId
            var taiKhoan = DBC.TaiKhoans.FirstOrDefault(tk => tk.MaTaiKhoan.ToString() == userId);
            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản.", UserID = userId });

            // Cập nhật tên đăng nhập (nếu có)
            if (!string.IsNullOrWhiteSpace(model.TenDangNhap))
            {
                // Kiểm tra trùng lặp tên đăng nhập
                if (DBC.TaiKhoans.Any(tk => tk.TenDangNhap == model.TenDangNhap && tk.MaTaiKhoan != taiKhoan.MaTaiKhoan))
                    return BadRequest("Tên đăng nhập đã tồn tại.");

                taiKhoan.TenDangNhap = model.TenDangNhap;
            }

            // Cập nhật mật khẩu nếu có
            if (!string.IsNullOrEmpty(model.MatKhauCu) || !string.IsNullOrEmpty(model.MatKhau) || !string.IsNullOrEmpty(model.NhapLaiMatKhau))
            {
                // Kiểm tra mật khẩu cũ có nhập không
                if (string.IsNullOrWhiteSpace(model.MatKhauCu))
                    return BadRequest("Vui lòng nhập mật khẩu cũ.");

                // Kiểm tra mật khẩu cũ có đúng không
                if (taiKhoan.HashMatKhau != HashPassword(model.MatKhauCu))
                    return BadRequest("Mật khẩu cũ không chính xác.");

                // Kiểm tra mật khẩu mới
                if (string.IsNullOrWhiteSpace(model.MatKhau) || string.IsNullOrWhiteSpace(model.NhapLaiMatKhau))
                    return BadRequest("Mật khẩu mới không được để trống.");

                if (model.MatKhau != model.NhapLaiMatKhau)
                    return BadRequest("Mật khẩu nhập lại không khớp.");

                // Mã hóa mật khẩu mới trước khi lưu
                taiKhoan.HashMatKhau = HashPassword(model.MatKhau);
            }

            // Lưu thay đổi vào database
            DBC.SaveChanges();

            return Ok(new { Message = "Cập nhật tài khoản thành công.", UpdatedData = taiKhoan });
        }


        // API cập nhật trạng thái tài khoản nhân viên
        [HttpPut("capnhattrangthainhanvien/{maNhanVien}")]
        [Authorize(Roles = "QuanLy")]
        public async Task<IActionResult> CapNhatTrangThaiNhanVien(Guid maNhanVien)
        {
            var taiKhoan = await DBC.TaiKhoans.FirstOrDefaultAsync(t => t.MaNhanVien == maNhanVien);
            if (taiKhoan == null)
            {
                return NotFound("Không tìm thấy tài khoản nhân viên.");
            }

            taiKhoan.TrangThaiTaiKhoan = taiKhoan.TrangThaiTaiKhoan == "Hoạt động" ? "Không Hoạt động" : "Hoạt động";
            DBC.Entry(taiKhoan).State = EntityState.Modified;
            await DBC.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật trạng thái thành công", taiKhoan.TrangThaiTaiKhoan });
        }

        // API cập nhật trạng thái tài khoản khách hàng
        [HttpPut("capnhattrangthaikhachhang/{maKhachHang}")]
        [Authorize(Roles = "QuanLy")]
        public async Task<IActionResult> CapNhatTrangThaiKhachHang(Guid maKhachHang)
        {
            var taiKhoan = await DBC.TaiKhoans.FirstOrDefaultAsync(t => t.MaKhachHang == maKhachHang);
            if (taiKhoan == null)
            {
                return NotFound("Không tìm thấy tài khoản khách hàng.");
            }

            taiKhoan.TrangThaiTaiKhoan = taiKhoan.TrangThaiTaiKhoan == "Hoạt động" ? "Không Hoạt động" : "Hoạt động";
            DBC.Entry(taiKhoan).State = EntityState.Modified;
            await DBC.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật trạng thái thành công", taiKhoan.TrangThaiTaiKhoan });
        }


    }
    public class TaoTaiKhoanNhanVienDTO
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
        public string NhapLaiMatKhau { get; set; } = string.Empty;
        public string MaNhanVien { get; set; } = string.Empty;
    }

    public class CapNhatTaiKhoanDTO
    {
        public string? TenDangNhap { get; set; } // Có thể cập nhật hoặc giữ nguyên
        public string? MatKhauCu { get; set; }
        public string? MatKhau { get; set; }     // Cập nhật nếu có nhập
        public string? NhapLaiMatKhau { get; set; } // Xác nhận lại mật khẩu
    }

    public class CapNhatTrangThaiDTO
    {
        public string MaTaiKhoan { get; set; }  
        public string TrangThai { get; set; }  
    }
    public class ThemNhanVienModel
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
