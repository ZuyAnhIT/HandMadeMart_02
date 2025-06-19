using MMartHandMade.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;


namespace MMartHandMade.Controllers
{
    [Route("api/danhgia")]
    [ApiController]
    public class DanhGiaController : ControllerBase
    {
        private readonly MartHandMadeContext DBC ;

        public DanhGiaController(MartHandMadeContext context)
        {
            DBC = context;
        }


        /// Khách hàng thêm đánh giá sản phẩm
        [HttpPost("ThemDanhGia")]
        [Authorize(Roles = "KhachHang")]
        public async Task<IActionResult> ThemDanhGia([FromForm] DanhGiaForm danhGiaInput)
        {
            if (danhGiaInput.MaSanPham == Guid.Empty || danhGiaInput.SoSao == null)
                return BadRequest("Dữ liệu không hợp lệ!");

            // Lấy userId từ token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Tìm tài khoản theo userId
            var taiKhoan = await DBC.TaiKhoans
                .FirstOrDefaultAsync(tk => tk.MaTaiKhoan.ToString() == userId);

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản.", UserID = userId });

            // Tìm khách hàng theo tài khoản
            var khachHang = await DBC.KhachHangs
                .FirstOrDefaultAsync(kh => kh.MaKhachHang == taiKhoan.MaKhachHang);

            if (khachHang == null)
                return NotFound(new { Message = "Không tìm thấy thông tin khách hàng." });

            // Kiểm tra sản phẩm có tồn tại không
            var sanPham = await DBC.SanPhams
                .FirstOrDefaultAsync(sp => sp.MaSanPham == danhGiaInput.MaSanPham);

            if (sanPham == null)
                return NotFound(new { Message = "Không tìm thấy sản phẩm cần đánh giá." });

            // Tạo đối tượng đánh giá mới
            var danhGia = new DanhGium
            {
                MaDanhGia = Guid.NewGuid(),
                SoSao = danhGiaInput.SoSao,
                BinhLuan = danhGiaInput.BinhLuan,
                NgayDanhGia = DateTime.Now,
                MaSanPham = danhGiaInput.MaSanPham,
                MaKhachHang = khachHang.MaKhachHang
            };

            // Lưu vào database
            DBC.DanhGia.Add(danhGia);
            await DBC.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đánh giá đã được thêm thành công!",
                DanhGiaID = danhGia.MaDanhGia
            });
        }


        // All danh gia
        [HttpGet("Danhsachdanhgia")]
        [Authorize(Roles = "QuanLy,NhanVien")]
        public async Task<IActionResult> LayTatCaDanhGia()
        {
            var danhGiaList = await DBC.DanhGia
                .Include(dg => dg.MaSanPhamNavigation)
                .Include(dg => dg.MaKhachHangNavigation)
                .Select(dg => new
                {
                    MaDanhGia = dg.MaDanhGia,
                    SoSao = dg.SoSao,
                    BinhLuan = dg.BinhLuan,
                    NgayDanhGia = dg.NgayDanhGia,
                    TenSanPham = dg.MaSanPhamNavigation.TenSanPham, // Lấy tên sản phẩm
                    TenKhachHang = dg.MaKhachHangNavigation.HoTenKhachHang // Lấy tên khách hàng
                })
                .ToListAsync();

            return Ok(danhGiaList);
        }


        // Đánh giá theo sản phẩm
        [HttpGet("SanPham/{maSanPham}")]
        public async Task<IActionResult> LayDanhGiaTheoSanPham(Guid maSanPham)
        {
            // Kiểm tra sản phẩm có tồn tại không
            var sanPham = await DBC.SanPhams
                .FirstOrDefaultAsync(sp => sp.MaSanPham == maSanPham);

            if (sanPham == null)
                return NotFound(new { Message = "Không tìm thấy sản phẩm." });

            // Lấy danh sách đánh giá của sản phẩm
            var danhGiaList = await DBC.DanhGia
                .Where(dg => dg.MaSanPham == maSanPham)
                .Include(dg => dg.MaKhachHangNavigation)
                .Select(dg => new
                {
                    MaDanhGia = dg.MaDanhGia,
                    SoSao = dg.SoSao,
                    BinhLuan = dg.BinhLuan,
                    NgayDanhGia = dg.NgayDanhGia,
                    TenKhachHang = dg.MaKhachHangNavigation.HoTenKhachHang // Lấy tên khách hàng đánh giá
                })
                .ToListAsync();

            return Ok(danhGiaList);
        }
        
        /*
        //API đánh giá cá nhân 
        [HttpGet("DanhGiaCaNhan")]
        public async Task<IActionResult> LayDanhGiaCuaChinhMinh()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Tìm tài khoản theo userId
            var taiKhoan = await DBC.TaiKhoans
                .FirstOrDefaultAsync(tk => tk.MaTaiKhoan.ToString() == userId);

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản.", UserID = userId });

            // Tìm khách hàng có tài khoản này
            var khachhang = await DBC.KhachHangs
                .FirstOrDefaultAsync(kh => kh.MaKhachHang == taiKhoan.MaKhachHang);

            if (khachhang == null)
                return NotFound(new { Message = "Không tìm thấy thông tin khách hàng.", MaTaiKhoan = userId });

            // Lấy danh sách đánh giá của khách hàng kèm theo tên sản phẩm
            var danhGiaList = await DBC.DanhGia
                .Where(dg => dg.MaKhachHang == khachhang.MaKhachHang)
                .Include(dg => dg.MaSanPhamNavigation)
                .Select(dg => new
                {
                    MaDanhGia = dg.MaDanhGia,
                    SoSao = dg.SoSao,
                    BinhLuan = dg.BinhLuan,
                    NgayDanhGia = dg.NgayDanhGia,
                    TenSanPham = dg.MaSanPhamNavigation.TenSanPham // Lấy tên sản phẩm
                })
                .ToListAsync();

            return Ok(danhGiaList);
        }
        */

    
        /// Quản lý xóa đánh giá
        [HttpDelete("Xoa/{maDanhGia}")]
        [Authorize(Roles = "QuanLy,NhanVien")]
        public async Task<IActionResult> XoaDanhGia(Guid maDanhGia)
        {
            var danhGia = await DBC.DanhGia.FindAsync(maDanhGia);
            if (danhGia == null)
                return NotFound("Không tìm thấy đánh giá!");

            DBC.DanhGia.Remove(danhGia);
            await DBC.SaveChangesAsync();

            return Ok(new { Message = "Đánh giá đã được xóa thành công!" });
        }
    }
    public class DanhGiaForm
    {
     
        public Guid MaSanPham { get; set; }

        
        [Range(1, 5, ErrorMessage = "Số sao phải từ 1 đến 5.")]
        public int SoSao { get; set; }

        [StringLength(500)]
        public string? BinhLuan { get; set; }
    }


}
