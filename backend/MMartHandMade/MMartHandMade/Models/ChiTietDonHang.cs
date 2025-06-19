using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("ChiTietDonHang")]
public partial class ChiTietDonHang
{
    [Key]
    [Column("maChiTietDonHang")]
    public Guid MaChiTietDonHang { get; set; }

    [Column("maDonHang")]
    public Guid MaDonHang { get; set; }

    [Column("maSanPham")]
    public Guid MaSanPham { get; set; }

    [Column("soLuongSanPham")]
    public int? SoLuongSanPham { get; set; }

    [Column("donGia", TypeName = "decimal(18, 2)")]
    public decimal? DonGia { get; set; }

    [ForeignKey("MaDonHang")]
    [InverseProperty("ChiTietDonHangs")]
    public virtual DonHang MaDonHangNavigation { get; set; } = null!;

    [ForeignKey("MaSanPham")]
    [InverseProperty("ChiTietDonHangs")]
    public virtual SanPham MaSanPhamNavigation { get; set; } = null!;
}
