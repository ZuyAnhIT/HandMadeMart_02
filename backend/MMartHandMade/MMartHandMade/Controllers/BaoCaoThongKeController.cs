using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MMartHandMade.Models;

namespace MMartHandMade.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaoCaoThongKeController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public BaoCaoThongKeController(MartHandMadeContext context)
        {
            DBC = context;
        }
        [HttpPost("ThongKeDoanhThuTheoThoiGian")]
        [Authorize(Roles = "QuanLy")]
        public async Task<IActionResult> ThongKeDoanhThu([FromForm] string loaiThongKe)
        {
            if (string.IsNullOrEmpty(loaiThongKe))
                return BadRequest("Vui lòng chọn loại thống kê: 'tuan', 'thang' hoặc 'nam'.");

            DateTime ngayHienTai = DateTime.UtcNow;
            DateTime ngayBatDau;

            switch (loaiThongKe.ToLower())
            {
                case "tuan":
                    ngayBatDau = ngayHienTai.AddDays(-7);
                    break;
                case "thang":
                    ngayBatDau = ngayHienTai.AddMonths(-1);
                    break;
                case "nam":
                    ngayBatDau = ngayHienTai.AddYears(-1);
                    break;
                default:
                    return BadRequest("Loại thống kê không hợp lệ! Chọn: 'tuan', 'thang', 'nam'.");
            }

            //  Lọc các đơn hàng đã giao trong khoảng thời gian
            var donHangs = await DBC.DonHangs
                .Where(dh => dh.NgayTaoDon >= ngayBatDau && dh.NgayTaoDon <= ngayHienTai && dh.TrangThaiDon == "Đã giao")
                .Include(dh => dh.ChiTietDonHangs)
                .ToListAsync();

            if (!donHangs.Any())
                return Ok(new { Message = "Không có đơn hàng nào trong khoảng thời gian này." });

            // Tính tổng số sản phẩm bán ra từ Chi tiết đơn hàng
            int tongSanPhamBanRa = donHangs
                .SelectMany(dh => dh.ChiTietDonHangs)
                .Sum(ct => ct.SoLuongSanPham ?? 0);

            // Tính tổng doanh thu trực tiếp từ `TongTien` trong Đơn hàng
            decimal tongDoanhThu = donHangs.Sum(dh => dh.TongTien ?? 0);

            // Trả về kết quả
            return Ok(new
            {
                LoaiThongKe = loaiThongKe,
                TuNgay = ngayBatDau,
                DenNgay = ngayHienTai,
                TongDoanhThu = tongDoanhThu,
                TongSanPhamBanRa = tongSanPhamBanRa
            });
        }

        [HttpPost("ThongKeTopSanPham")]
        [Authorize(Roles = "QuanLy")]
        public async Task<IActionResult> ThongKeTopSanPham([FromForm] string loaiThongKe)
        {
            if (string.IsNullOrEmpty(loaiThongKe))
                return BadRequest("Vui lòng chọn loại thống kê: 'tuan', 'thang' hoặc 'nam'.");

            DateTime ngayHienTai = DateTime.UtcNow;
            DateTime ngayBatDau;

            switch (loaiThongKe.ToLower())
            {
                case "tuan":
                    ngayBatDau = ngayHienTai.AddDays(-7);
                    break;
                case "thang":
                    ngayBatDau = ngayHienTai.AddMonths(-1);
                    break;
                case "nam":
                    ngayBatDau = ngayHienTai.AddYears(-1);
                    break;
                default:
                    return BadRequest("Loại thống kê không hợp lệ! Chọn: 'tuan', 'thang', 'nam'.");
            }

            // Lọc đơn hàng trong khoảng thời gian
            var donHangs = await DBC.DonHangs
                .Where(dh => dh.NgayTaoDon >= ngayBatDau && dh.NgayTaoDon <= ngayHienTai && dh.TrangThaiDon == "Đã giao")
                .Include(dh => dh.ChiTietDonHangs)
                .ThenInclude(ct => ct.MaSanPhamNavigation) // Load sản phẩm
                .ToListAsync();

            if (!donHangs.Any())
                return Ok(new { Message = "Không có đơn hàng nào trong khoảng thời gian này." });

            // Tính doanh thu của từng sản phẩm
            var doanhThuSanPham = donHangs
                .SelectMany(dh => dh.ChiTietDonHangs)
                .GroupBy(ct => ct.MaSanPhamNavigation.TenSanPham)
                .Select(g => new
                {
                    TenSanPham = g.Key,
                    DoanhThu = g.Sum(ct => (ct.SoLuongSanPham ?? 0) * (ct.DonGia ?? 0))
                })
                .OrderByDescending(sp => sp.DoanhThu)
                .ToList();

            // Tính tổng doanh thu của tất cả sản phẩm
            decimal tongDoanhThu = doanhThuSanPham.Sum(sp => sp.DoanhThu);

            if (tongDoanhThu == 0)
                return Ok(new { Message = "Không có doanh thu trong khoảng thời gian này." });

            // Lấy 3 sản phẩm có doanh thu cao nhất
            var top3SanPham = doanhThuSanPham.Take(3).ToList();

            // Tính tổng doanh thu của các sản phẩm còn lại
            decimal doanhThuKhac = doanhThuSanPham.Skip(3).Sum(p => p.DoanhThu);

            // Tính tỷ lệ phần trăm
            var danhSachSanPham = top3SanPham
                .Select(sp => new
                {
                    sp.TenSanPham,
                    sp.DoanhThu,
                    PhanTram = Math.Round((sp.DoanhThu / tongDoanhThu) * 100, 2)
                })
                .ToList();

            if (doanhThuKhac > 0)
            {
                danhSachSanPham.Add(new
                {
                    TenSanPham = "Khác",
                    DoanhThu = doanhThuKhac,
                    PhanTram = Math.Round((doanhThuKhac / tongDoanhThu) * 100, 2)
                });
            }

            return Ok(new
            {
                LoaiThongKe = loaiThongKe,
                TuNgay = ngayBatDau,
                DenNgay = ngayHienTai,
                TongDoanhThu = tongDoanhThu,
                SanPham = danhSachSanPham
            });
        }



    }
}
