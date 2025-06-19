using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MMartHandMade.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

[Route("api/taiKhoan")]
[ApiController]
public class DangNhapController : ControllerBase
{
    private readonly MartHandMadeContext DBC;
    private readonly IConfiguration _config;

    public DangNhapController(MartHandMadeContext context, IConfiguration config)
    {
        DBC = context;
        _config = config;
    }

    [HttpPost("dangNhap")]
    public async Task<IActionResult> Login([FromForm] DangNhaprequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.TenDangNhap) || string.IsNullOrEmpty(request.MatKhau))
            return BadRequest("Tên đăng nhập và mật khẩu không được để trống.");

        // Tìm tài khoản theo tên đăng nhập
        var taiKhoan = await DBC.TaiKhoans
            .FirstOrDefaultAsync(tk => tk.TenDangNhap == request.TenDangNhap);

        if (taiKhoan == null || taiKhoan.TrangThaiTaiKhoan != "Hoạt động")
            return Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng.");

        // Hash mật khẩu nhập vào để so sánh
        string hashedInputPassword = HashPassword(request.MatKhau);
        if (hashedInputPassword != taiKhoan.HashMatKhau)
            return Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng.");

        // Tạo token JWT
        string token = GenerateJwtToken(taiKhoan);

        return Ok(new { Token = token, VaiTro = taiKhoan.VaiTro, TrangThai = taiKhoan.TrangThaiTaiKhoan });
    }

    private string GenerateJwtToken(TaiKhoan taiKhoan)
    {
        var jwtSettings = _config.GetSection("JwtSettings");

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, taiKhoan.MaTaiKhoan.ToString()),
            new Claim(ClaimTypes.Name, taiKhoan.TenDangNhap),
            new Claim(ClaimTypes.Role, taiKhoan.VaiTro),
            new Claim("UserId", taiKhoan.MaTaiKhoan.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpireMinutes"])),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
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
    public class DangNhaprequest
    {
        public string TenDangNhap { get; set; } = string.Empty;
        public string MatKhau { get; set; } = string.Empty;
    }
}
