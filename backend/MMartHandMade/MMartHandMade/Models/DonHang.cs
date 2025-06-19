using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("DonHang")]
public partial class DonHang
{
    [Key]
    [Column("maDonHang")]
    public Guid MaDonHang { get; set; }

    [Column("ngayTaoDon", TypeName = "datetime")]
    public DateTime? NgayTaoDon { get; set; }

    [Column("trangThaiDon")]
    [StringLength(50)]
    public string? TrangThaiDon { get; set; }

    [Column("phuongThucTT")]
    [StringLength(500)]
    public string? PhuongThucTt { get; set; }

    [Column("diaChiNhan")]
    [StringLength(500)]
    public string DiaChiNhan { get; set; } = null!;

    [Column("sdtLienHe")]
    [StringLength(20)]
    public string SdtLienHe { get; set; } = null!;

    [Column("tongTien", TypeName = "decimal(18, 2)")]
    public decimal? TongTien { get; set; }

    [Column("maNhanVien")]
    public Guid MaNhanVien { get; set; }

    [Column("maKhachHang")]
    public Guid MaKhachHang { get; set; }

    [InverseProperty("MaDonHangNavigation")]
    public virtual ICollection<ChiTietDonHang> ChiTietDonHangs { get; set; } = new List<ChiTietDonHang>();

    [ForeignKey("MaKhachHang")]
    [InverseProperty("DonHangs")]
    public virtual KhachHang MaKhachHangNavigation { get; set; } = null!;

    [ForeignKey("MaNhanVien")]
    [InverseProperty("DonHangs")]
    public virtual NhanVien MaNhanVienNavigation { get; set; } = null!;
}
