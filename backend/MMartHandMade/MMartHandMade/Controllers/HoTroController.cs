using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MMartHandMade.Models;

namespace MMartHandMade.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HoTroController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public HoTroController(MartHandMadeContext context)
        {
            DBC = context;
        }

        ///  Thêm hỗ trợ
        [HttpPost("ThemHoTro")]
        public async Task<IActionResult> ThemHoTro([FromForm] string tenKhachHang, [FromForm] string soDienThoai, [FromForm] string email, [FromForm] string noiDung)
        {
            if (string.IsNullOrWhiteSpace(tenKhachHang) || string.IsNullOrWhiteSpace(soDienThoai)
                || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(noiDung))
            {
                return BadRequest("Vui lòng nhập đầy đủ thông tin hỗ trợ.");
            }

            // Tạo đối tượng mới
            var hoTro = new HoTro
            {
                MaLienHe = Guid.NewGuid(),
                TenKhachHang = tenKhachHang,
                SoDienThoai = soDienThoai,
                Email = email,
                NoiDung = noiDung,
                TrangThai = "Chưa liên hệ"
            };

            // Random mã nhân viên từ danh sách
            var nhanVienList = await DBC.NhanViens.ToListAsync();
            if (!nhanVienList.Any())
                return BadRequest("Không có nhân viên nào để gán.");

            var random = new Random();
            int index = random.Next(nhanVienList.Count);
            hoTro.MaNhanVien = nhanVienList[index].MaNhanVien;

            // Lưu vào DB
            DBC.HoTros.Add(hoTro);
            await DBC.SaveChangesAsync();

            return Ok(new
            {
                Message = "Yêu cầu hỗ trợ đã được thêm thành công!",
                MaLienHe = hoTro.MaLienHe,
                MaNhanVien = hoTro.MaNhanVien,
                TrangThai = hoTro.TrangThai
            });
        }
        ///  Xem tất cả hỗ trợ
        [HttpGet("DanhSachHoTro")]
        public async Task<IActionResult> LayTatCaHoTro()
        {
            var listHoTro = await DBC.HoTros
                .Include(ht => ht.MaNhanVienNavigation)
                .Select(ht => new
                {
                    ht.MaLienHe,
                    ht.TenKhachHang,
                    ht.SoDienThoai,
                    ht.Email,
                    ht.NoiDung,
                    ht.TrangThai,
                    TenNhanVien = ht.MaNhanVienNavigation.HoTenNhanVien
                })
                .ToListAsync();

            return Ok(listHoTro);
        }

        /// Cập nhật trạng thái hỗ trợ
        [HttpPut("CapNhatTrangThai/{maLienHe}")]
        public async Task<IActionResult> CapNhatTrangThai(Guid maLienHe, [FromForm] string trangThaiMoi)
        {
            var hoTro = await DBC.HoTros.FindAsync(maLienHe);
            if (hoTro == null)
                return NotFound("Không tìm thấy yêu cầu hỗ trợ.");

            var cacTrangThaiChoPhep = new[] { "Chưa liên hệ", "Đang liên hệ", "Đã liên hệ" };
            if (!cacTrangThaiChoPhep.Contains(trangThaiMoi))
                return BadRequest("Trạng thái không hợp lệ.");

            hoTro.TrangThai = trangThaiMoi;
            await DBC.SaveChangesAsync();

            return Ok(new
            {
                Message = "Cập nhật trạng thái thành công!",
                MaLienHe = maLienHe,
                TrangThaiMoi = trangThaiMoi
            });
        }

        /// Xoá yêu cầu hỗ trợ
        [HttpDelete("Xoa/{maLienHe}")]
        public async Task<IActionResult> XoaHoTro(Guid maLienHe)
        {
            var hoTro = await DBC.HoTros.FindAsync(maLienHe);
            if (hoTro == null)
                return NotFound("Không tìm thấy yêu cầu hỗ trợ.");

            DBC.HoTros.Remove(hoTro);
            await DBC.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã xoá yêu cầu hỗ trợ thành công!",
                MaLienHe = maLienHe
            });
        }


    }
}
