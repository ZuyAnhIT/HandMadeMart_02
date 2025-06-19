using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("TaiKhoan")]
[Index("TenDangNhap", Name = "UQ__TaiKhoan__59267D4A3188FCE5", IsUnique = true)]
public partial class TaiKhoan
{
    [Key]
    [Column("maTaiKhoan")]
    public Guid MaTaiKhoan { get; set; }

    [Column("tenDangNhap")]
    [StringLength(100)]
    [Unicode(false)]
    public string TenDangNhap { get; set; } = null!;

    [Column("hashMatKhau")]
    [StringLength(512)]
    [Unicode(false)]
    public string HashMatKhau { get; set; } = null!;

    [Column("vaiTro")]
    [StringLength(50)]
    public string VaiTro { get; set; } = null!;

    [Column("trangThaiTaiKhoan")]
    [StringLength(20)]
    public string? TrangThaiTaiKhoan { get; set; }

    [Column("maNhanVien")]
    public Guid? MaNhanVien { get; set; }

    [Column("maKhachHang")]
    public Guid? MaKhachHang { get; set; }

    [Column("maQuanLy")]
    public Guid? MaQuanLy { get; set; }

    [ForeignKey("MaKhachHang")]
    [InverseProperty("TaiKhoans")]
    public virtual KhachHang? MaKhachHangNavigation { get; set; }

    [ForeignKey("MaNhanVien")]
    [InverseProperty("TaiKhoans")]
    public virtual NhanVien? MaNhanVienNavigation { get; set; }

    [ForeignKey("MaQuanLy")]
    [InverseProperty("TaiKhoans")]
    public virtual QuanLy? MaQuanLyNavigation { get; set; }
}
