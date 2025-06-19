using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

[Table("QuanLy")]
public partial class QuanLy
{
    [Key]
    [Column("maQuanLy")]
    public Guid MaQuanLy { get; set; }

    [Column("hoTenQuanLy")]
    [StringLength(255)]
    public string HoTenQuanLy { get; set; } = null!;

    [InverseProperty("MaQuanLyNavigation")]
    public virtual ICollection<TaiKhoan> TaiKhoans { get; set; } = new List<TaiKhoan>();
}
