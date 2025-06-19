document.addEventListener("DOMContentLoaded", function () {
  if (!document.getElementById("dashboard-page")) return;

  const monthlyRevenueElement = document.querySelector(
    ".stat-card:nth-child(1) .stat-value"
  );
  const yearlyRevenueElement = document.querySelector(
    ".stat-card:nth-child(2) .stat-value"
  );
  const weeklyRevenueElement = document.querySelector(
    ".stat-card:nth-child(3) .stat-value"
  );

  const earningsChartCanvas = document.getElementById("earningsChart");
  const revenueChartCanvas = document.getElementById("revenueChart");

  let earningsChart;
  let revenueChart;

  function updateChart(
    existingChart,
    canvasElement,
    labels,
    values,
    labelText
  ) {
    if (existingChart) existingChart.destroy();

    return new Chart(canvasElement, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: labelText,
            data: values,
            backgroundColor: "#4e73df",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  async function updateChartsAndStats(loaiThongKe) {
    try {
      const formData = new FormData();
      formData.append("loaiThongKe", loaiThongKe);

      const response = await fetch(
        "http://localhost:5258/api/BaoCaoThongKe/ThongKeDoanhThuTheoThoiGian",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();

      if (!data || typeof data.tongDoanhThu === "undefined") return;

      const doanhThu = data.tongDoanhThu;

      // Cập nhật số tổng ở thẻ
      if (loaiThongKe === "thang") {
        monthlyRevenueElement.textContent = `$${doanhThu.toLocaleString()}`;
      } else if (loaiThongKe === "nam") {
        yearlyRevenueElement.textContent = `$${doanhThu.toLocaleString()}`;
      } else if (loaiThongKe === "tuan") {
        weeklyRevenueElement.textContent = `${doanhThu.toLocaleString()}`;
        document.querySelector(
          ".stat-card:nth-child(3) .progress"
        ).style.width = `${doanhThu}%`;
      }

      // Xử lý dữ liệu biểu đồ chi tiết
      const chiTiet = data.chiTiet;
      let labels = [];
      let values = [];

      if (Array.isArray(chiTiet) && chiTiet.length > 0) {
        labels = chiTiet.map((item) => item.label);
        values = chiTiet.map((item) => item.giaTri);
      } else {
        labels = ["Doanh thu"];
        values = [doanhThu];
      }

      const chartLabel =
        loaiThongKe === "tuan"
          ? "Doanh thu theo tuần"
          : loaiThongKe === "nam"
          ? "Doanh thu theo năm"
          : loaiThongKe === "thang"
          ? "Doanh thu theo tháng"
          : "Doanh thu";

      earningsChart = updateChart(
        earningsChart,
        earningsChartCanvas,
        labels,
        values,
        chartLabel
      );
    } catch (error) {}
  }

  async function updateProductRevenueChart(loaiThongKe) {
    try {
      const formData = new FormData();
      formData.append("loaiThongKe", loaiThongKe);

      const response = await fetch(
        "http://localhost:5258/api/BaoCaoThongKe/ThongKeTopSanPham",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      console.log("📦 Dữ liệu sản phẩm trả về:", data);

      const sanPhamList = data.sanPham?.$values;

      if (!Array.isArray(sanPhamList) || sanPhamList.length === 0) {
        console.warn("⚠ Không có dữ liệu sản phẩm.");
        return;
      }

      const labels = sanPhamList.map((sp) => sp.tenSanPham);
      const values = sanPhamList.map((sp) => sp.phanTram);

      if (revenueChart) revenueChart.destroy();
      revenueChart = new Chart(revenueChartCanvas, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Tỷ lệ doanh thu",
              data: values,
              backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.raw}%`;
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("❌ Lỗi gọi API doanh thu sản phẩm:", error);
    }
  }

  // Dropdown lọc thời gian
  document.querySelectorAll(".dropdown-content a").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const period = this.dataset.period;

      document
        .querySelectorAll(".dropdown-content a")
        .forEach((el) => el.classList.remove("active"));
      this.classList.add("active");

      const mappedPeriod =
        period === "month"
          ? "thang"
          : period === "year"
          ? "nam"
          : period === "week"
          ? "tuan"
          : "doanhthu";

      updateChartsAndStats(mappedPeriod);
      updateProductRevenueChart(mappedPeriod);
    });
  });

  // Gọi mặc định khi vào dashboard
  updateChartsAndStats("thang");
  updateChartsAndStats("nam");
  updateChartsAndStats("tuan");

  // Biểu đồ sản phẩm chỉ cần gọi 1 lần (mặc định theo tháng)
  updateProductRevenueChart("tuan");
  updateProductRevenueChart("thang");
  updateProductRevenueChart("nam");
});
