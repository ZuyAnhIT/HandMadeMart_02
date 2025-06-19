using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MMartHandMade.Models;

namespace MMartHandMade.Controllers
{
    [Route("api/danhmucsanpham")]
    [ApiController]
    public class DanhMucSanPhamController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public DanhMucSanPhamController(MartHandMadeContext context)
        {
            DBC = context;
        }

        //API: Lấy danh sách danh mục sản phẩm 
        [HttpGet("LayDanhSach")]
        public async Task<IActionResult> GetAll()
        {
            var danhMucs = await DBC.DanhMucSanPhams
                .Select(dm => new { dm.MaDanhMuc, dm.TenDanhMuc })
                .ToListAsync();

            return Ok(danhMucs);
        }

        // API: LayDanhMucChiTiet
        [HttpGet("LayDanhSachChiTiet")]
        public async Task<IActionResult> GetAllDetals()
        {
            var danhMucs = await DBC.DanhMucSanPhams
                .Include(dm => dm.SanPhams) // Nạp danh sách sản phẩm trong danh mục
                .Select(dm => new
                {
                    dm.MaDanhMuc,
                    dm.TenDanhMuc,
                    SanPhams = dm.SanPhams.Select(sp => new
                    {
                        sp.MaSanPham,
                        sp.TenSanPham
                    }).ToList()
                })
                .ToListAsync();

            return Ok(danhMucs);
        }


        // API: Thêm danh mục (Chỉ QuanLy, NhanVien)
        [HttpPost("ThemDanhMuc")]
        [Authorize(Roles = "QuanLy,NhanVien")]
        public IActionResult AddDanhMucSanPham([FromForm] DanhMucSanPhamDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TenDanhMuc))
                return BadRequest("Tên danh mục không được để trống.");

            var danhMuc = new DanhMucSanPham
            {
                MaDanhMuc = Guid.NewGuid(),
                TenDanhMuc = dto.TenDanhMuc
            };

            DBC.DanhMucSanPhams.Add(danhMuc);
            DBC.SaveChanges();

            return Ok(new { message = "Thêm danh mục thành công!", danhMuc });
        }

        // API: Sửa danh mục (Chỉ QuanLy, NhanVien)
        [HttpPut("CapNhat/{maDanhMuc}")]
        [Authorize(Roles = "QuanLy,NhanVien")]
        public IActionResult UpdateDanhMucSanPham(Guid maDanhMuc, [FromForm] DanhMucSanPhamDTO dto)
        {
            var danhMuc = DBC.DanhMucSanPhams.Find(maDanhMuc);
            if (danhMuc == null)
                return NotFound("Danh mục không tồn tại.");

            if (string.IsNullOrWhiteSpace(dto.TenDanhMuc))
                return BadRequest("Tên danh mục không được để trống.");

            danhMuc.TenDanhMuc = dto.TenDanhMuc;

            DBC.DanhMucSanPhams.Update(danhMuc);
            DBC.SaveChanges();

            return Ok(new { message = "Cập nhật danh mục thành công!", danhMuc });
        }

        // API: Xóa danh mục (Chỉ QuanLy, NhanVien)
        [HttpDelete("Xoa/{maDanhMuc}")]
        [Authorize(Roles = "QuanLy,NhanVien")]
        public IActionResult DeleteDanhMucSanPham(Guid maDanhMuc)
        {
            var danhMuc = DBC.DanhMucSanPhams.Find(maDanhMuc);
            if (danhMuc == null)
                return NotFound("Danh mục không tồn tại.");

            DBC.DanhMucSanPhams.Remove(danhMuc);
            DBC.SaveChanges();

            return Ok(new { message = "Xóa danh mục thành công!" });
        }
    }
    public class DanhMucSanPhamDTO
    {
        public string TenDanhMuc { get; set; } = string.Empty;
    }
}