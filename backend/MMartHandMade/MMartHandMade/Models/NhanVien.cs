using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("NhanVien")]
[Index("SoDienThoaiNhanVien", Name = "UQ__NhanVien__74F285522635C29D", IsUnique = true)]
[Index("EmailNhanVien", Name = "UQ__NhanVien__81D3C06BD25C03A5", IsUnique = true)]
public partial class NhanVien
{
    [Key]
    [Column("maNhanVien")]
    public Guid MaNhanVien { get; set; }

    [Column("hoTenNhanVien")]
    [StringLength(255)]
    public string HoTenNhanVien { get; set; } = null!;

    [Column("diaChiNhanVien")]
    [StringLength(255)]
    public string DiaChiNhanVien { get; set; } = null!;

    [Column("emailNhanVien")]
    [StringLength(50)]
    [Unicode(false)]
    public string EmailNhanVien { get; set; } = null!;

    [Column("soDienThoaiNhanVien")]
    [StringLength(20)]
    [Unicode(false)]
    public string SoDienThoaiNhanVien { get; set; } = null!;

    [InverseProperty("MaNhanVienNavigation")]
    public virtual ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();

    [InverseProperty("MaNhanVienNavigation")]
    public virtual ICollection<HoTro> HoTros { get; set; } = new List<HoTro>();

    [InverseProperty("MaNhanVienNavigation")]
    public virtual ICollection<TaiKhoan> TaiKhoans { get; set; } = new List<TaiKhoan>();
}
