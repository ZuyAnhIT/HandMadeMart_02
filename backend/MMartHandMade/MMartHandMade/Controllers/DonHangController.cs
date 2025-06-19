using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MMartHandMade.Models;
using System;
using System.Security.Claims;

namespace MMartHandMade.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonHangController : ControllerBase
    {

        private readonly MartHandMadeContext DBC;

        public DonHangController(MartHandMadeContext context)
        {
            DBC = context;
        }

        // Danh  sách đơn hàng 
        [HttpGet("DanhSachDonHang")]
        public async Task<ActionResult<IEnumerable<object>>> GetDanhSachDonHangs()
        {
            var donHangs = await DBC.DonHangs
                .Select(d => new
                {
                    d.MaDonHang,
                    d.NgayTaoDon,
                    d.TrangThaiDon,
                    d.TongTien,
                    d.PhuongThucTt,
                    TenNhanVien = DBC.NhanViens
                        .Where(nv => nv.MaNhanVien == d.MaNhanVien)
                        .Select(nv => nv.HoTenNhanVien)
                        .FirstOrDefault(),
                    TenKhachHang = DBC.KhachHangs
                        .Where(kh => kh.MaKhachHang == d.MaKhachHang)
                        .Select(kh => kh.HoTenKhachHang)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(donHangs);
        }


        // API lấy đơn hàng tổng thể
        [HttpGet("AllDanhSach")]
        public async Task<ActionResult<IEnumerable<object>>> GetDonHangs()
        {
            var donHangs = await DBC.DonHangs
                .Include(d => d.ChiTietDonHangs)
                .Select(d => new
                {
                    d.MaDonHang,
                    d.NgayTaoDon,
                    d.TrangThaiDon,
                    d.TongTien,
                    d.PhuongThucTt,
                    d.MaNhanVienNavigation.HoTenNhanVien,

                    TenNhanVien = DBC.NhanViens
                .Where(nv => nv.MaNhanVien == d.MaNhanVien)
                .Select(nv => nv.HoTenNhanVien)
                .FirstOrDefault(),  

                    TenKhachHang = DBC.KhachHangs
                        .Where(k => k.MaKhachHang == d.MaKhachHang)
                        .Select(k => k.HoTenKhachHang)
                        .FirstOrDefault(),
                    d.ChiTietDonHangs
                })
                .ToListAsync();

            return Ok(donHangs);
        }

        // API lấy chi tiết đơn hàng 
        [HttpGet("ChiTiet/{maDonHang}")]
        public async Task<ActionResult<IEnumerable<object>>> GetChiTietDonHang(Guid maDonHang)
        {
            var chiTietDonHang = await DBC.ChiTietDonHangs
                .Where(ct => ct.MaDonHang == maDonHang)
                .Select(ct => new
                {
                    ct.MaChiTietDonHang,
                    ct.MaSanPham,
                    TenSanPham = DBC.SanPhams
                        .Where(sp => sp.MaSanPham == ct.MaSanPham)
                        .Select(sp => sp.TenSanPham)
                        .FirstOrDefault(),
                    ct.SoLuongSanPham,
                    ct.DonGia
                })
                .ToListAsync();

            if (!chiTietDonHang.Any())
                return NotFound("Không tìm thấy chi tiết đơn hàng.");

            return Ok(chiTietDonHang);
        }


        // API lấy đơn hàng cá nhân 
        [HttpGet("DanhSachCaNhan")]
        [Authorize(Roles = "KhachHang")]
        public async Task<ActionResult<IEnumerable<object>>> GetDonHangsByKhachHang()
        {
            // Lấy userId từ token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Lấy tài khoản từ userId
            var taiKhoan = await DBC.TaiKhoans.FirstOrDefaultAsync(tk => tk.MaTaiKhoan.ToString() == userId);
            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản.", UserID = userId });

            // Lấy MaKhachHang từ tài khoản
            var maKhachHang = taiKhoan.MaKhachHang;
            if (maKhachHang == null)
                return NotFound(new { Message = "Không tìm thấy khách hàng liên kết với tài khoản.", MaTaiKhoan = userId });

            // Lấy danh sách đơn hàng của khách hàng này + Chi tiết + Sản phẩm
            var donHangs = await DBC.DonHangs
                .Where(d => d.MaKhachHang == maKhachHang)
                .Include(d => d.ChiTietDonHangs)
                .Select(d => new
                {
                    d.MaDonHang,
                    d.NgayTaoDon,
                    d.TongTien,
                    d.TrangThaiDon,
                    d.DiaChiNhan,
                    d.PhuongThucTt,
                    ChiTietDonHangs = d.ChiTietDonHangs.Select(ct => new
                    {
                        ct.MaChiTietDonHang,
                        ct.MaSanPham,
                        TenSanPham = ct.MaSanPhamNavigation.TenSanPham, // Lấy tên sản phẩm
                        ct.SoLuongSanPham,
                        ct.DonGia
                    })
                })
                .ToListAsync();

            if (!donHangs.Any())
                return NotFound(new { Message = "Không tìm thấy đơn hàng nào." });

            return Ok(donHangs);
        }

        // API hủy đơn hàng
        [HttpPut("HuyDonHang/{maDonHang}")]
        [Authorize(Roles = "KhachHang")]
        public async Task<IActionResult> HuyDonHang(string maDonHang)
        {
            // Lấy userId từ token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
            if (userId == null)
                return Unauthorized("Không xác định được người dùng.");

            // Tìm tài khoản của khách hàng
            var taiKhoan = await DBC.TaiKhoans
                .FirstOrDefaultAsync(tk => tk.MaTaiKhoan.ToString() == userId);

            if (taiKhoan == null)
                return NotFound(new { Message = "Không tìm thấy tài khoản.", UserID = userId });

            // Lấy mã khách hàng từ tài khoản
            var maKhachHang = taiKhoan.MaKhachHang;

            // Tìm đơn hàng của khách
            var donHang = await DBC.DonHangs
                .Include(dh => dh.ChiTietDonHangs)
                .FirstOrDefaultAsync(dh => dh.MaDonHang.ToString() == maDonHang && dh.MaKhachHang == maKhachHang);

            if (donHang == null)
                return NotFound(new { Message = "Không tìm thấy đơn hàng hoặc bạn không có quyền huỷ đơn này." });

            // Kiểm tra trạng thái đơn hàng có phải "Chờ " không
            if (donHang.TrangThaiDon != "Chờ")
                return BadRequest("Chỉ có thể huỷ đơn hàng ở trạng thái 'Chờ'.");

            // Cập nhật kho hàng: hoàn trả số lượng sản phẩm
            foreach (var chiTiet in donHang.ChiTietDonHangs)
            {
                var sanPham = await DBC.SanPhams.FirstOrDefaultAsync(sp => sp.MaSanPham == chiTiet.MaSanPham);
                if (sanPham != null)
                {
                    sanPham.SoLuongTon += chiTiet.SoLuongSanPham; // Cộng lại số lượng tồn
                    sanPham.SoLuongBan -= chiTiet.SoLuongSanPham; // Trừ số lượng bán
                }
            }

            // Cập nhật trạng thái thành "Đã huỷ"
            donHang.TrangThaiDon = "Hủy";

            // Lưu thay đổi vào database
            await DBC.SaveChangesAsync();

            return Ok(new { Message = "Huỷ đơn hàng thành công và cập nhật kho hàng.", DonHang = donHang });
        }

        // API cập nhật trạng thái đơn hàng
        [HttpPut("CapNhatTrangThai/{maDonHang}")]
        [Authorize(Roles = "NhanVien,QuanLy")]
        public async Task<IActionResult> CapNhatTrangThai(string maDonHang, [FromForm] string trangThaiMoi)
        {
            // Tìm đơn hàng cần cập nhật
            var donHang = await DBC.DonHangs
                .Include(dh => dh.ChiTietDonHangs)
                .FirstOrDefaultAsync(dh => dh.MaDonHang.ToString() == maDonHang);

            if (donHang == null)
                return NotFound(new { Message = "Không tìm thấy đơn hàng." });

            // Danh sách trạng thái hợp lệ
            var trangThaiHopLe = new List<string> { "Chờ", "Đã duyệt", "Đang giao", "Đã giao", "Huỷ" };

            if (!trangThaiHopLe.Contains(trangThaiMoi))
                return BadRequest(new { Message = "Trạng thái không hợp lệ." });

            // Kiểm tra điều kiện cập nhật trạng thái
            if (donHang.TrangThaiDon == "Hoàn thành" || donHang.TrangThaiDon == "Huỷ")
                return BadRequest(new { Message = "Không thể thay đổi trạng thái đơn hàng đã hoàn tất hoặc đã huỷ." });

            if (donHang.TrangThaiDon == "Chờ" && trangThaiMoi == "Huỷ")
            {
                // Cập nhật kho hàng nếu huỷ đơn
                foreach (var chiTiet in donHang.ChiTietDonHangs)
                {
                    var sanPham = await DBC.SanPhams.FirstOrDefaultAsync(sp => sp.MaSanPham == chiTiet.MaSanPham);
                    if (sanPham != null)
                    {
                        sanPham.SoLuongTon += chiTiet.SoLuongSanPham; // Cộng lại số lượng tồn
                        sanPham.SoLuongBan -= chiTiet.SoLuongSanPham; // Trừ số lượng bán
                    }
                }
            }

            // Cập nhật trạng thái đơn hàng
            donHang.TrangThaiDon = trangThaiMoi;

            // Lưu thay đổi vào database
            await DBC.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật trạng thái đơn hàng thành công.", DonHang = donHang });
        }

        // API khách thêm đơn hàng 
        [HttpPost("ThemDonHang")]
        public async Task<IActionResult> ThemDonHang([FromBody] DonHangRequest request)
        {
            if (request == null || request.ChiTietDonHangs == null || !request.ChiTietDonHangs.Any())
                return BadRequest("Dữ liệu đơn hàng không hợp lệ.");

            if (string.IsNullOrWhiteSpace(request.SoDienThoai) || string.IsNullOrWhiteSpace(request.DiaChiGiaoHang))
                return BadRequest("Số điện thoại và địa chỉ giao hàng không được để trống.");

            using var transaction = await DBC.Database.BeginTransactionAsync();
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value?.ToUpper();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("Không xác định được người dùng.");

                var taiKhoan = await DBC.TaiKhoans.FirstOrDefaultAsync(tk => tk.MaTaiKhoan.ToString() == userId);
                if (taiKhoan == null)
                    return NotFound("Không tìm thấy tài khoản.");

                var maKhachHang = taiKhoan.MaKhachHang ?? Guid.Empty;
                if (maKhachHang == Guid.Empty)
                    return BadRequest("Không tìm thấy mã khách hàng.");

                var nhanVien = await DBC.NhanViens.OrderBy(nv => Guid.NewGuid()).FirstOrDefaultAsync();
                if (nhanVien == null)
                    return BadRequest("Không có nhân viên nào trong hệ thống.");

                // Tạo đơn hàng mới
                var donHang = new DonHang
                {
                    MaDonHang = Guid.NewGuid(),
                    MaKhachHang = maKhachHang,
                    MaNhanVien = nhanVien.MaNhanVien,
                    TrangThaiDon = "Chờ",
                    NgayTaoDon = DateTime.UtcNow,
                    DiaChiNhan = request.DiaChiGiaoHang,
                    SdtLienHe = request.SoDienThoai,
                    PhuongThucTt = "Khi nhận",
                    TongTien = 0,
                    ChiTietDonHangs = new List<ChiTietDonHang>()
                };

                decimal tongTien = 0;
                var danhSachSanPham = new List<SanPham>();

                foreach (var chiTiet in request.ChiTietDonHangs)
                {
                    var sanPham = await DBC.SanPhams.FirstOrDefaultAsync(sp => sp.MaSanPham == chiTiet.MaSanPham);
                    if (sanPham == null)
                        return BadRequest($"Sản phẩm {chiTiet.MaSanPham} không tồn tại.");

                    if (sanPham.SoLuongTon < chiTiet.SoLuong)
                        return BadRequest($"Sản phẩm {sanPham.TenSanPham} không đủ hàng trong kho.");

                    decimal thanhTien = chiTiet.SoLuong * chiTiet.GiaBan;
                    tongTien += thanhTien;

                    donHang.ChiTietDonHangs.Add(new ChiTietDonHang
                    {
                        MaChiTietDonHang = Guid.NewGuid(),
                        MaSanPham = chiTiet.MaSanPham,
                        SoLuongSanPham = chiTiet.SoLuong,
                        DonGia = chiTiet.GiaBan
                    });

                    danhSachSanPham.Add(sanPham);
                }

                donHang.TongTien = tongTien;

                // Lưu đơn hàng trước khi cập nhật số lượng tồn kho
                DBC.DonHangs.Add(donHang);
                await DBC.SaveChangesAsync();

                // Cập nhật số lượng sản phẩm trong kho
                foreach (var chiTiet in donHang.ChiTietDonHangs)
                {
                    var sanPham = danhSachSanPham.First(sp => sp.MaSanPham == chiTiet.MaSanPham);
                    sanPham.SoLuongTon -= chiTiet.SoLuongSanPham;
                    sanPham.SoLuongBan += chiTiet.SoLuongSanPham;
                }

                await DBC.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Đơn hàng đã được tạo thành công.",
                    DonHang = donHang
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    Message = "Lỗi khi tạo đơn hàng.",
                    Error = ex.InnerException?.Message ?? ex.Message
                });
            }
        }


    }
    public class DonHangRequest
    {
        public string DiaChiGiaoHang { get; set; }    // Địa chỉ giao hàng
        public string SoDienThoai { get; set; }       // Số điện thoại liên hệ
        public List<ChiTietDonHangRequest> ChiTietDonHangs { get; set; }  // Danh sách sản phẩm đặt hàng
    }

    public class ChiTietDonHangRequest
    {
        public Guid MaSanPham { get; set; }  // Mã sản phẩm
        public int SoLuong { get; set; }     // Số lượng đặt mua
        public decimal GiaBan { get; set; }  // Giá bán tại thời điểm mua

    }

}
