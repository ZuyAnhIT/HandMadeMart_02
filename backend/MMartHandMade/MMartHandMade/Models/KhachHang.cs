using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("KhachHang")]
[Index("EmailKhach", Name = "UQ__KhachHan__35FABFC8F206CD0C", IsUnique = true)]
[Index("SoDienThoaiKhach", Name = "UQ__KhachHan__8BA5230F94E2802C", IsUnique = true)]
public partial class KhachHang
{
    [Key]
    [Column("maKhachHang")]
    public Guid MaKhachHang { get; set; }

    [Column("hoTenKhachHang")]
    [StringLength(255)]
    public string HoTenKhachHang { get; set; } = null!;

    [Column("diaChiKhach")]
    [StringLength(255)]
    public string DiaChiKhach { get; set; } = null!;

    [Column("emailKhach")]
    [StringLength(50)]
    [Unicode(false)]
    public string EmailKhach { get; set; } = null!;

    [Column("soDienThoaiKhach")]
    [StringLength(20)]
    [Unicode(false)]
    public string SoDienThoaiKhach { get; set; } = null!;

    [InverseProperty("MaKhachHangNavigation")]
    public virtual ICollection<DanhGium> DanhGia { get; set; } = new List<DanhGium>();

    [InverseProperty("MaKhachHangNavigation")]
    public virtual ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();

    [InverseProperty("MaKhachHangNavigation")]
    public virtual ICollection<TaiKhoan> TaiKhoans { get; set; } = new List<TaiKhoan>();
}
