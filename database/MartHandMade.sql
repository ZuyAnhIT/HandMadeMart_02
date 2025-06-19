-- Tạo cơ sở dữ liệu
CREATE DATABASE StoreHandMade;
GO

-- Sử dụng cơ sở dữ liệu mới tạo
USE StoreHandMade;
GO

-- Tao bang danh muc
CREATE TABLE DanhMucSanPham (
    maDanhMuc UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenDanhMuc NVARCHAR(255) UNIQUE NOT NULL,
);
GO

-- Tao bang san pham 
CREATE TABLE SanPham (
    maSanPham UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenSanPham NVARCHAR(255) UNIQUE NOT NULL,
    moTa NVARCHAR(500) NULL,
	anhSanPham VARCHAR(500) UNIQUE NOT NULL,
    soLuongTon INT CHECK (soLuongTon >= 0) DEFAULT 0,
    soLuongBan INT CHECK (soLuongBan >= 0) DEFAULT 0,
    giaBan DECIMAL(18,2) CHECK (giaBan >= 0),
    ngayTao DATETIME DEFAULT GETDATE(),
    trangThai NVARCHAR(50) DEFAULT N'Còn hàng' 
        CHECK (trangThai IN (N'Còn hàng', N'Hết hàng', N'Dừng bán')),
    maDanhMuc UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (maDanhMuc) REFERENCES DanhMucSanPham(maDanhMuc) ON DELETE SET NULL
);
GO

-- Tao bang khach hang
CREATE TABLE KhachHang (
    maKhachHang UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    hoTenKhachHang NVARCHAR(255) NOT NULL,
    diaChiKhach NVARCHAR(255) NOT NULL,
    emailKhach VARCHAR(50) UNIQUE NOT NULL,
    soDienThoaiKhach VARCHAR(20) UNIQUE NOT NULL
);
GO

-- Tao bang nhan vien
CREATE TABLE NhanVien (
    maNhanVien UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    hoTenNhanVien NVARCHAR(255) NOT NULL,
    diaChiNhanVien NVARCHAR(255) NOT NULL,
    emailNhanVien VARCHAR(50) UNIQUE NOT NULL,
    soDienThoaiNhanVien VARCHAR(20) UNIQUE NOT NULL,
);
GO

--Tao bang quan ly
CREATE TABLE QuanLy (
    maQuanLy UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
	 hoTenQuanLy NVARCHAR(255) NOT NULL,
);
GO

--Tao bang tai khoan 
CREATE TABLE TaiKhoan (
    maTaiKhoan UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenDangNhap VARCHAR(100) UNIQUE NOT NULL,
    hashMatKhau VARCHAR(512) NOT NULL,
    vaiTro NVARCHAR(50) CHECK (vaiTro IN (N'KhachHang', N'NhanVien', N'QuanLy')) NOT NULL,
	trangThaiTaiKhoan NVARCHAR(20) CHECK (trangThaiTaiKhoan IN (N'Hoạt động', N'Không hoạt động')),
    maNhanVien UNIQUEIDENTIFIER NULL,
    maKhachHang UNIQUEIDENTIFIER NULL,
    maQuanLy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_TaiKhoan_NhanVien FOREIGN KEY (maNhanVien) REFERENCES NhanVien(maNhanVien),
    CONSTRAINT FK_TaiKhoan_KhachHang FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang),
    CONSTRAINT FK_TaiKhoan_QuanLy FOREIGN KEY (maQuanLy) REFERENCES QuanLy(maQuanLy),
    CONSTRAINT CK_TaiKhoan_OnlyOneFK CHECK (
        (maNhanVien IS NOT NULL AND maKhachHang IS NULL AND maQuanLy IS NULL) OR
        (maNhanVien IS NULL AND maKhachHang IS NOT NULL AND maQuanLy IS NULL) OR
        (maNhanVien IS NULL AND maKhachHang IS NULL AND maQuanLy IS NOT NULL)
    )
);
GO

-- Tao bang danh gia 
CREATE TABLE DanhGia (
    maDanhGia UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    soSao INT CHECK (soSao BETWEEN 1 AND 5),
    binhLuan NVARCHAR(500) NULL,
    ngayDanhGia DATETIME DEFAULT GETDATE(),
    
    maSanPham UNIQUEIDENTIFIER NOT NULL,  -- Thêm NOT NULL
    maKhachHang UNIQUEIDENTIFIER NOT NULL,  -- Thêm NOT NULL

    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham),
    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang)
);
GO

-- Tao bang don hang
CREATE TABLE DonHang (
    maDonHang UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ngayTaoDon DATETIME DEFAULT GETDATE(),
    trangThaiDon NVARCHAR(50) CHECK (trangThaiDon IN (N'Chờ', N'Đã duyệt', N'Đang giao', N'Đã giao', N'Hủy')),
    phuongThucTT NVARCHAR(500) DEFAULT N'Khi nhận',
    diaChiNhan NVARCHAR(500) NOT NULL,
    sdtLienHe NVARCHAR(20) NOT NULL,
    tongTien DECIMAL(18,2) CHECK (tongTien >= 0),

    maNhanVien UNIQUEIDENTIFIER NOT NULL,  
    maKhachHang UNIQUEIDENTIFIER NOT NULL,

    FOREIGN KEY (maNhanVien) REFERENCES NhanVien(maNhanVien),
    FOREIGN KEY (maKhachHang) REFERENCES KhachHang(maKhachHang),
);
GO

-- Tao bang chi tiet don hang
CREATE TABLE ChiTietDonHang (
    maChiTietDonHang UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    maDonHang UNIQUEIDENTIFIER NOT NULL,  -- Thêm NOT NULL đúng cách
    maSanPham UNIQUEIDENTIFIER NOT NULL,  -- Thêm NOT NULL đúng cách
    soLuongSanPham INT CHECK (soLuongSanPham >= 1),
    donGia  DECIMAL(18,2) CHECK (donGia>= 0),

     
    FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang),
    FOREIGN KEY (maSanPham) REFERENCES SanPham(maSanPham)
);
GO

CREATE TABLE HoTro (
    maLienHe UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenKhachHang NVARCHAR(100) NOT NULL,
    soDienThoai VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    noiDung NVARCHAR(500)  NOT NULL,
    trangThai NVARCHAR(50) NOT NULL DEFAULT N'Chưa liên hệ',
    CONSTRAINT chk_trangThai CHECK (trangThai IN (N'Chưa liên hệ', N'Đang liên hệ', N'Đã liên hệ')),
    maNhanVien UNIQUEIDENTIFIER NOT NULL, 
    FOREIGN KEY (maNhanVien) REFERENCES NhanVien(maNhanVien)
);

-- Thêm danh mục sản phẩm
INSERT INTO DanhMucSanPham (tenDanhMuc) VALUES 
(N'Trang Sức'), 
(N'Phụ Kiện'), 
(N'Quà Tặng');

-- Thêm sản phẩm
INSERT INTO SanPham (tenSanPham, moTa, anhSanPham, soLuongTon, giaBan, maDanhMuc) 
VALUES 
(N'Vòng tay gỗ', N'Vòng tay handmade làm từ gỗ tự nhiên', 'vongtaygo.jpg', 50, 150000, 
(SELECT maDanhMuc FROM DanhMucSanPham WHERE tenDanhMuc = N'Trang Sức')),

(N'Khuyên tai bạc', N'Khuyên tai thiết kế tinh tế, chất liệu bạc 925', 'khuyentai.jpg', 30, 200000, 
(SELECT maDanhMuc FROM DanhMucSanPham WHERE tenDanhMuc = N'Phụ Kiện')),

(N'Hộp quà gỗ', N'Hộp quà handmade từ gỗ, thiết kế đẹp mắt', 'hopquago.jpg', 20, 300000, 
(SELECT maDanhMuc FROM DanhMucSanPham WHERE tenDanhMuc = N'Quà Tặng'));

-- Thêm khách hàng
INSERT INTO KhachHang (hoTenKhachHang, diaChiKhach, emailKhach, soDienThoaiKhach) 
VALUES 
(N'Nguyễn Văn A', N'123 Đường ABC, Hà Nội', 'nguyenvana@gmail.com', '0987654321'),
(N'Trần Thị B', N'456 Đường XYZ, TP.HCM', 'tranthib@gmail.com', '0976543210');

-- Thêm nhân viên
INSERT INTO NhanVien (hoTenNhanVien, diaChiNhanVien, emailNhanVien, soDienThoaiNhanVien) 
VALUES 
(N'Lê Văn C', N'789 Đường DEF, Đà Nẵng', 'levanc@gmail.com', '0961234567'),
(N'Phạm Minh D', N'101 Đường GHI, Hải Phòng', 'phamminhd@gmail.com', '0951234567');

-- Thêm quản lý
INSERT INTO QuanLy (hoTenQuanLy) 
VALUES (N'Hoàng Quốc E');

-- Thêm tài khoản
INSERT INTO TaiKhoan (tenDangNhap, hashMatKhau, vaiTro, trangThaiTaiKhoan, maNhanVien) 
VALUES 
('levanc', HASHBYTES('SHA2_512', 'matkhau1'), N'NhanVien', N'Hoạt động', (SELECT maNhanVien FROM NhanVien WHERE hoTenNhanVien = N'Lê Văn C'));

INSERT INTO TaiKhoan (tenDangNhap, hashMatKhau, vaiTro, trangThaiTaiKhoan, maNhanVien) 
VALUES 
('phamminhd', HASHBYTES('SHA2_512', 'matkhau2'), N'NhanVien', N'Hoạt động', (SELECT maNhanVien FROM NhanVien WHERE hoTenNhanVien = N'Phạm Minh D'));

INSERT INTO TaiKhoan (tenDangNhap, hashMatKhau, vaiTro, trangThaiTaiKhoan, maKhachHang) 
VALUES 
('nguyenvana', HASHBYTES('SHA2_512', 'matkhau3'), N'KhachHang', N'Hoạt động', (SELECT maKhachHang FROM KhachHang WHERE hoTenKhachHang = N'Nguyễn Văn A'));

INSERT INTO TaiKhoan (tenDangNhap, hashMatKhau, vaiTro, trangThaiTaiKhoan, maKhachHang) 
VALUES 
('tranthib', HASHBYTES('SHA2_512', 'matkhau4'), N'KhachHang', N'Hoạt động', (SELECT maKhachHang FROM KhachHang WHERE hoTenKhachHang = N'Trần Thị B'));

INSERT INTO TaiKhoan (tenDangNhap, hashMatKhau, vaiTro, trangThaiTaiKhoan, maQuanLy) 
VALUES 
('hoangquoce', HASHBYTES('SHA2_512', 'matkhau5'), N'QuanLy', N'Hoạt động', (SELECT maQuanLy FROM QuanLy WHERE hoTenQuanLy = N'Hoàng Quốc E'));

-- Thêm đánh giá sản phẩm
INSERT INTO DanhGia (soSao, binhLuan, maSanPham, maKhachHang) 
VALUES 
(5, N'Sản phẩm rất đẹp, chất lượng tốt!', (SELECT maSanPham FROM SanPham WHERE tenSanPham = N'Vòng tay gỗ'), 
 (SELECT maKhachHang FROM KhachHang WHERE hoTenKhachHang = N'Nguyễn Văn A'));


-- Thêm đơn hàng
INSERT INTO DonHang (ngayTaoDon, trangThaiDon, phuongThucTT, diaChiNhan, sdtLienHe, tongTien, maNhanVien, maKhachHang) 
VALUES 
(GETDATE(), N'Chờ', N'Khi nhận', N'123 Đường ABC, Hà Nội', '0987654321', 450000, 
 (SELECT maNhanVien FROM NhanVien WHERE hoTenNhanVien = N'Lê Văn C'),
 (SELECT maKhachHang FROM KhachHang WHERE hoTenKhachHang = N'Nguyễn Văn A'));
 GO
-- Thêm chi tiết đơn hàng
INSERT INTO ChiTietDonHang (maChiTietDonHang, maDonHang, maSanPham, soLuongSanPham, donGia) 
VALUES 
(NEWID(), 
 (SELECT maDonHang FROM DonHang WHERE maKhachHang = (SELECT maKhachHang FROM KhachHang WHERE hoTenKhachHang = N'Nguyễn Văn A')), 
 (SELECT maSanPham FROM SanPham WHERE tenSanPham = N'Vòng tay gỗ'), 
 3, 
 5000000);


SELECT * FROM KhachHang;
SELECT * FROM SanPham;
SELECT * FROM NhanVien;
SELECT * FROM DanhMucSanPham;
SELECT * FROM TaiKhoan;
SELECT * FROM DanhGia;
SELECT * FROM DonHang;
SELECT * FROM ChiTietDonHang;
SELECT * FROM QuanLy;




DECLARE @maKhachHang UNIQUEIDENTIFIER, @maQuanLy UNIQUEIDENTIFIER

-- Lấy mã khách hàng của Nguyễn Duy Anh
SELECT @maKhachHang = maKhachHang 
FROM KhachHang 
WHERE hoTenKhachHang = N'Nguyễn Duy Anh'
-- Thêm Nguyễn Duy Anh vào bảng QuanLy
INSERT INTO QuanLy (hoTenQuanLy) 
VALUES (N'Nguyễn Duy Anh');

-- Lấy mã quản lý vừa thêm
SET @maQuanLy = (SELECT maQuanLy FROM QuanLy WHERE hoTenQuanLy = N'Nguyễn Duy Anh');

-- Cập nhật bảng TaiKhoan
UPDATE TaiKhoan 
SET maQuanLy = @maQuanLy, maKhachHang = NULL, vaiTro = N'QuanLy'
WHERE maKhachHang = @maKhachHang;

-- Xóa Nguyễn Duy Anh khỏi bảng KhachHang
DELETE FROM KhachHang WHERE maKhachHang = '1C741B43-7548-4B1D-B996-84E361DF1BBD' ;

DECLARE @maKhachHang_NamAnh UNIQUEIDENTIFIER, @maNhanVien UNIQUEIDENTIFIER

-- Lấy mã khách hàng của Nguyễn Nam Anh
SELECT @maKhachHang_NamAnh = maKhachHang 
FROM KhachHang 
WHERE hoTenKhachHang = N'Nguyễn Nam Anh';

-- Thêm Nguyễn Nam Anh vào bảng NhanVien
INSERT INTO NhanVien (hoTenNhanVien, diaChiNhanVien, emailNhanVien, soDienThoaiNhanVien) 
SELECT hoTenKhachHang, diaChiKhach, emailKhach, soDienThoaiKhach 
FROM KhachHang 
WHERE maKhachHang = @maKhachHang_NamAnh;

-- Lấy mã nhân viên vừa thêm
SET @maNhanVien = (SELECT maNhanVien FROM NhanVien WHERE hoTenNhanVien = N'Nguyễn Nam Anh');

-- Cập nhật bảng TaiKhoan
UPDATE TaiKhoan 
SET maNhanVien = @maNhanVien, maKhachHang = NULL, vaiTro = N'NhanVien'
WHERE maKhachHang = @maKhachHang_NamAnh;

-- Xóa Nguyễn Nam Anh khỏi bảng KhachHang
DELETE FROM KhachHang WHERE maKhachHang = '91254B2E-153A-4253-9D20-D4B2CEFF792E';

DELETE FROM DanhMucSanPham WHERE maDanhMuc = 'F20B8509-82A2-41D7-8210-E4EB9F09D087';
