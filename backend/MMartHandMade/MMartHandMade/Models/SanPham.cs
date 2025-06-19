using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("SanPham")]
[Index("TenSanPham", Name = "UQ__SanPham__122BB7F4CB84155D", IsUnique = true)]
[Index("AnhSanPham", Name = "UQ__SanPham__C615B2A9ACCA9698", IsUnique = true)]
public partial class SanPham
{
    [Key]
    [Column("maSanPham")]
    public Guid MaSanPham { get; set; }

    [Column("tenSanPham")]
    [StringLength(255)]
    public string TenSanPham { get; set; } = null!;

    [Column("moTa")]
    [StringLength(500)]
    public string? MoTa { get; set; }

    [Column("anhSanPham")]
    [StringLength(500)]
    [Unicode(false)]
    public string AnhSanPham { get; set; } = null!;

    [Column("soLuongTon")]
    public int? SoLuongTon { get; set; }

    [Column("soLuongBan")]
    public int? SoLuongBan { get; set; }

    [Column("giaBan", TypeName = "decimal(18, 2)")]
    public decimal? GiaBan { get; set; }

    [Column("ngayTao", TypeName = "datetime")]
    public DateTime? NgayTao { get; set; }

    [Column("trangThai")]
    [StringLength(50)]
    public string? TrangThai { get; set; }

    [Column("maDanhMuc")]
    public Guid? MaDanhMuc { get; set; }

    [InverseProperty("MaSanPhamNavigation")]
    public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();

    [InverseProperty("MaSanPhamNavigation")]
    public virtual ICollection<DanhGium> DanhGia { get; set; } = new List<DanhGium>();

    [ForeignKey("MaDanhMuc")]
    [InverseProperty("SanPhams")]
    public virtual DanhMucSanPham? MaDanhMucNavigation { get; set; }
}
