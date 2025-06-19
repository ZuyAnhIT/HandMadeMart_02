using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MMartHandMade.Models;

public partial class MartHandMadeContext : DbContext
{
    public MartHandMadeContext()
    {
    }

    public MartHandMadeContext(DbContextOptions<MartHandMadeContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ChiTietDonHang> ChiTietDonHangs { get; set; }

    public virtual DbSet<DanhGium> DanhGia { get; set; }

    public virtual DbSet<DanhMucSanPham> DanhMucSanPhams { get; set; }

    public virtual DbSet<DonHang> DonHangs { get; set; }

    public virtual DbSet<HoTro> HoTros { get; set; }

    public virtual DbSet<KhachHang> KhachHangs { get; set; }

    public virtual DbSet<NhanVien> NhanViens { get; set; }

    public virtual DbSet<QuanLy> QuanLies { get; set; }

    public virtual DbSet<SanPham> SanPhams { get; set; }

    public virtual DbSet<TaiKhoan> TaiKhoans { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=DESKTOP-TBHP8NU\\SQLEXPRESS;Database=StoreHandMade;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ChiTietDonHang>(entity =>
        {
            entity.HasKey(e => e.MaChiTietDonHang).HasName("PK__ChiTietD__F581B9059BE29775");

            entity.Property(e => e.MaChiTietDonHang).ValueGeneratedNever();

            entity.HasOne(d => d.MaDonHangNavigation).WithMany(p => p.ChiTietDonHangs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChiTietDo__maDon__02084FDA");

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.ChiTietDonHangs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChiTietDo__maSan__02FC7413");
        });

        modelBuilder.Entity<DanhGium>(entity =>
        {
            entity.HasKey(e => e.MaDanhGia).HasName("PK__DanhGia__6B15DD9A0FE87CE4");

            entity.Property(e => e.MaDanhGia).HasDefaultValueSql("(newid())");
            entity.Property(e => e.NgayDanhGia).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.DanhGia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGia__maKhach__74AE54BC");

            entity.HasOne(d => d.MaSanPhamNavigation).WithMany(p => p.DanhGia)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DanhGia__maSanPh__73BA3083");
        });

        modelBuilder.Entity<DanhMucSanPham>(entity =>
        {
            entity.HasKey(e => e.MaDanhMuc).HasName("PK__DanhMucS__6B0F914C40634043");

            entity.Property(e => e.MaDanhMuc).HasDefaultValueSql("(newid())");
        });

        modelBuilder.Entity<DonHang>(entity =>
        {
            entity.HasKey(e => e.MaDonHang).HasName("PK__DonHang__871D381989125FFE");

            entity.Property(e => e.MaDonHang).HasDefaultValueSql("(newid())");
            entity.Property(e => e.NgayTaoDon).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.PhuongThucTt).HasDefaultValue("Khi nhận");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.DonHangs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonHang__maKhach__7D439ABD");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.DonHangs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonHang__maNhanV__7C4F7684");
        });

        modelBuilder.Entity<HoTro>(entity =>
        {
            entity.HasKey(e => e.MaLienHe).HasName("PK__HoTro__C18B70663B50828D");

            entity.Property(e => e.MaLienHe).HasDefaultValueSql("(newid())");
            entity.Property(e => e.TrangThai).HasDefaultValue("Chưa liên hệ");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.HoTros)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__HoTro__maNhanVie__18EBB532");
        });

        modelBuilder.Entity<KhachHang>(entity =>
        {
            entity.HasKey(e => e.MaKhachHang).HasName("PK__KhachHan__0CCB3D49265CA5DC");

            entity.Property(e => e.MaKhachHang).HasDefaultValueSql("(newid())");
        });

        modelBuilder.Entity<NhanVien>(entity =>
        {
            entity.HasKey(e => e.MaNhanVien).HasName("PK__NhanVien__BDDEF20DE9E6A636");

            entity.Property(e => e.MaNhanVien).HasDefaultValueSql("(newid())");
        });

        modelBuilder.Entity<QuanLy>(entity =>
        {
            entity.HasKey(e => e.MaQuanLy).HasName("PK__QuanLy__449603AD8320FB54");

            entity.Property(e => e.MaQuanLy).HasDefaultValueSql("(newid())");
        });

        modelBuilder.Entity<SanPham>(entity =>
        {
            entity.HasKey(e => e.MaSanPham).HasName("PK__SanPham__5B439C434210C24E");

            entity.Property(e => e.MaSanPham).HasDefaultValueSql("(newid())");
            entity.Property(e => e.NgayTao).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.SoLuongBan).HasDefaultValue(0);
            entity.Property(e => e.SoLuongTon).HasDefaultValue(0);
            entity.Property(e => e.TrangThai).HasDefaultValue("Còn hàng");

            entity.HasOne(d => d.MaDanhMucNavigation).WithMany(p => p.SanPhams)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__SanPham__maDanhM__5812160E");
        });

        modelBuilder.Entity<TaiKhoan>(entity =>
        {
            entity.HasKey(e => e.MaTaiKhoan).HasName("PK__TaiKhoan__8FFF6A9DB083C46D");

            entity.Property(e => e.MaTaiKhoan).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.MaKhachHangNavigation).WithMany(p => p.TaiKhoans).HasConstraintName("FK_TaiKhoan_KhachHang");

            entity.HasOne(d => d.MaNhanVienNavigation).WithMany(p => p.TaiKhoans).HasConstraintName("FK_TaiKhoan_NhanVien");

            entity.HasOne(d => d.MaQuanLyNavigation).WithMany(p => p.TaiKhoans).HasConstraintName("FK_TaiKhoan_QuanLy");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
