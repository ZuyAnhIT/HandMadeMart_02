using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("HoTro")]
public partial class HoTro
{
    [Key]
    [Column("maLienHe")]
    public Guid MaLienHe { get; set; }

    [Column("tenKhachHang")]
    [StringLength(100)]
    public string TenKhachHang { get; set; } = null!;

    [Column("soDienThoai")]
    [StringLength(15)]
    [Unicode(false)]
    public string SoDienThoai { get; set; } = null!;

    [Column("email")]
    [StringLength(100)]
    [Unicode(false)]
    public string Email { get; set; } = null!;

    [Column("noiDung")]
    [StringLength(500)]
    public string NoiDung { get; set; } = null!;

    [Column("trangThai")]
    [StringLength(50)]
    public string TrangThai { get; set; } = null!;

    [Column("maNhanVien")]
    public Guid MaNhanVien { get; set; }

    [ForeignKey("MaNhanVien")]
    [InverseProperty("HoTros")]
    public virtual NhanVien MaNhanVienNavigation { get; set; } = null!;
}
