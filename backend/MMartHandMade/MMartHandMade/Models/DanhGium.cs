using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

public partial class DanhGium
{
    [Key]
    [Column("maDanhGia")]
    public Guid MaDanhGia { get; set; }

    [Column("soSao")]
    public int? SoSao { get; set; }

    [Column("binhLuan")]
    [StringLength(500)]
    public string? BinhLuan { get; set; }

    [Column("ngayDanhGia", TypeName = "datetime")]
    public DateTime? NgayDanhGia { get; set; }

    [Column("maSanPham")]
    public Guid MaSanPham { get; set; }

    [Column("maKhachHang")]
    public Guid MaKhachHang { get; set; }

    [ForeignKey("MaKhachHang")]
    [InverseProperty("DanhGia")]
    public virtual KhachHang MaKhachHangNavigation { get; set; } = null!;

    [ForeignKey("MaSanPham")]
    [InverseProperty("DanhGia")]
    public virtual SanPham MaSanPhamNavigation { get; set; } = null!;
}
