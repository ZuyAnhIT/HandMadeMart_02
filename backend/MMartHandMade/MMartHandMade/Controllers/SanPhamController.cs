using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MMartHandMade.Models;


namespace MMartHandMade.Controllers
{
    [Route("api/sanpham")]
    [ApiController]
    public class SanPhamController : ControllerBase
    {
        private readonly MartHandMadeContext DBC;

        public SanPhamController(MartHandMadeContext context)
        {
            DBC = context;
        }

        // API: Lấy danh sách sản phẩm
        [HttpGet("LayDanhSach")]
        [AllowAnonymous]
        public IActionResult GetSanPhams()
        {
            var sanPhams = DBC.SanPhams
                .Include(sp => sp.MaDanhMucNavigation) // Load thông tin danh mục
                .Select(static sp => new
                {
                    sp.MaSanPham,
                    sp.TenSanPham,
                    sp.MoTa,
                    sp.AnhSanPham,
                    sp.SoLuongTon,
                    sp.SoLuongBan,
                    sp.GiaBan,
                    sp.NgayTao,
                    sp.TrangThai,
                    sp.MaDanhMuc,
                    TenDanhMuc = sp.MaDanhMucNavigation.TenDanhMuc // Hiển thị tên danh mục
                })
                .ToList();

            return Ok(new { data = sanPhams });

        }

        // API lay chi tiet san pham 
        [HttpGet("LaySanPham/{maSanPham}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSanPhamTheoMa(Guid maSanPham)
        {
            var sanPham = await DBC.SanPhams
                .Include(sp => sp.MaDanhMucNavigation) // Load thông tin danh mục
                .Where(sp => sp.MaSanPham == maSanPham)
                .Select(sp => new
                {
                    sp.MaSanPham,
                    sp.TenSanPham,
                    sp.MoTa,
                    sp.AnhSanPham,
                    sp.SoLuongTon,
                    sp.SoLuongBan,
                    sp.GiaBan,
                    sp.NgayTao,
                    sp.TrangThai,
                    sp.MaDanhMuc,
                    TenDanhMuc = sp.MaDanhMucNavigation.TenDanhMuc // Hiển thị tên danh mục
                })
                .FirstOrDefaultAsync();

            if (sanPham == null)
            {
                return NotFound(new { Message = "Không tìm thấy sản phẩm!" });
            }

            return Ok(sanPham);
        }

        //Tìm kiếm sản phẩm
        [HttpPost("TimKiemSanPham")]
        public async Task<IActionResult> TimKiemSanPham([FromForm] string tenSanPham)
        {
            // Kiểm tra xem tên sản phẩm có được cung cấp hay không
            if (string.IsNullOrEmpty(tenSanPham))
                return BadRequest(new { Message = "Tên sản phẩm không được để trống." });

            // Chuẩn hóa tên sản phẩm và tìm kiếm không phân biệt hoa thường
            var sanPhamList = await DBC.SanPhams
                .Where(sp => sp.TenSanPham.ToLower().Contains(tenSanPham.ToLower())) // Tìm kiếm không phân biệt hoa thường
                .Select(sp => new
                {
                    sp.MaSanPham,
                    sp.TenSanPham,
                    sp.AnhSanPham,
                    sp.GiaBan,
                    sp.SoLuongBan
                })
                .ToListAsync();

            if (!sanPhamList.Any())
                return NotFound(new { Message = "Không tìm thấy sản phẩm với tên chứa '" + tenSanPham + "'." });

            return Ok(sanPhamList);
        }



        [HttpPost("ThemSanPham")]
        //[Authorize(Roles = "QuanLy,NhanVien")]
        public IActionResult Add2SanPham([FromForm] SanPhamDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TenSanPham))
                return BadRequest("Tên sản phẩm không được để trống.");

            if (dto.GiaBan < 0)
                return BadRequest("Giá bán không hợp lệ.");

            // Tìm mã danh mục dựa trên tên danh mục
            var danhMuc = DBC.DanhMucSanPhams.FirstOrDefault(d => d.TenDanhMuc == dto.TenDanhMuc);
            if (danhMuc == null)
                return BadRequest("Danh mục không tồn tại.");

            var sanPham = new SanPham
            {
                MaSanPham = Guid.NewGuid(),
                TenSanPham = dto.TenSanPham,
                MoTa = dto.MoTa,
                AnhSanPham = dto.AnhSanPham,
                SoLuongTon = dto.SoLuongTon ?? 0,
                SoLuongBan = dto.SoLuongBan ?? 0,
                GiaBan = dto.GiaBan,
                NgayTao = DateTime.Now,
                TrangThai = dto.TrangThai,
                MaDanhMuc = danhMuc.MaDanhMuc // Gán mã danh mục tìm được
            };

            DBC.SanPhams.Add(sanPham);
            DBC.SaveChanges();

            return Ok(new { message = "Thêm sản phẩm thành công!", sanPham });
        }


   
        // API cập nhật sản phẩm 
        [HttpPut("CapNhat/{maSanPham}")]
        //[Authorize(Roles = "QuanLy,NhanVien")]
        public IActionResult Update2SanPham(Guid maSanPham, [FromForm] SanPhamDTO dto)
        {
            var sanPham = DBC.SanPhams.Find(maSanPham);
            if (sanPham == null)
                return NotFound("Sản phẩm không tồn tại.");

            // Nếu có tên danh mục, tìm mã danh mục
            if (!string.IsNullOrWhiteSpace(dto.TenDanhMuc))
            {
                var danhMuc = DBC.DanhMucSanPhams.FirstOrDefault(d => d.TenDanhMuc == dto.TenDanhMuc);
                if (danhMuc == null)
                    return BadRequest("Danh mục không tồn tại.");

                sanPham.MaDanhMuc = danhMuc.MaDanhMuc;
            }

            // Chỉ cập nhật các trường có giá trị mới, giữ nguyên nếu null hoặc rỗng
            if (!string.IsNullOrWhiteSpace(dto.TenSanPham))
                sanPham.TenSanPham = dto.TenSanPham;

            if (!string.IsNullOrWhiteSpace(dto.MoTa))
                sanPham.MoTa = dto.MoTa;

            if (!string.IsNullOrWhiteSpace(dto.AnhSanPham))
                sanPham.AnhSanPham = dto.AnhSanPham;

            if (dto.SoLuongTon.HasValue)
                sanPham.SoLuongTon = dto.SoLuongTon;

            if (dto.SoLuongBan.HasValue)
                sanPham.SoLuongBan = dto.SoLuongBan;

            if (dto.GiaBan.HasValue && dto.GiaBan >= 0)
                sanPham.GiaBan = dto.GiaBan;

            if (!string.IsNullOrWhiteSpace(dto.TrangThai))
                sanPham.TrangThai = dto.TrangThai;

            DBC.SanPhams.Update(sanPham);
            DBC.SaveChanges();

            return Ok(new { message = "Cập nhật sản phẩm thành công!", sanPham });
        }

    }


   

    // DTO để nhận dữ liệu từ request body
    public class SanPhamDTO
    {
        public string TenSanPham { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public string AnhSanPham { get; set; } = string.Empty;
        public int? SoLuongTon { get; set; }
        public int? SoLuongBan { get; set; }
        public decimal? GiaBan { get; set; }
        public string? TrangThai { get; set; }
        public Guid? MaDanhMuc { get; set; }
        public string? TenDanhMuc { get; set; } 
    }

}
