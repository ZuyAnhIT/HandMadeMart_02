using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("DanhMucSanPham")]
[Index("TenDanhMuc", Name = "UQ__DanhMucS__ED84A4B14ED8E8D2", IsUnique = true)]
public partial class DanhMucSanPham
{
    [Key]
    [Column("maDanhMuc")]
    public Guid MaDanhMuc { get; set; }

    [Column("tenDanhMuc")]
    [StringLength(255)]
    public string TenDanhMuc { get; set; } = null!;

    [InverseProperty("MaDanhMucNavigation")]
    public virtual ICollection<SanPham> SanPhams { get; set; } = new List<SanPham>();
}
