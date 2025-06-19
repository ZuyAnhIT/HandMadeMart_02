using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using MMartHandMade.Models;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình lấy thông tin từ appsettings.json
var configuration = builder.Configuration;

// Kiểm tra và lấy thông tin cấu hình JWT
var jwtSettings = configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrEmpty(secretKey))
{
    throw new Exception("Lỗi: SecretKey không được để trống");
}

var key = Encoding.UTF8.GetBytes(secretKey);

// Cấu hình Authentication với JWT
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

// Thêm dịch vụ Authorization
builder.Services.AddAuthorization();

// Thêm CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
    });

// Thêm dịch vụ Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình kết nối Database
var connectionString = configuration.GetConnectionString("StoreHandMade");
if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("Lỗi: ConnectionString không được để trống");
}

builder.Services.AddDbContext<MartHandMadeContext>(opt =>
    opt.UseSqlServer(connectionString));

var app = builder.Build();

// Áp dụng CORS trước Authentication & Authorization
app.UseCors("AllowAll");

// Kích hoạt Swagger nếu đang chạy môi trường Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Cấu hình Middleware Authentication & Authorization
app.UseAuthentication();  // Xác thực người dùng trước
app.UseAuthorization();  // Kiểm tra quyền truy cập

// Map Controllers
app.MapControllers();

// Chạy ứng dụng
app.Run();
