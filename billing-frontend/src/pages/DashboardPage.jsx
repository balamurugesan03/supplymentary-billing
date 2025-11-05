import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, message } from "antd";
import { getDashboardStats } from "../services/productService";
import {
  RiseOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import "./DashboardPage.css";

const DashboardPage = () => {
  const [data, setData] = useState({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    totalGST: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getDashboardStats();
        if (res?.data) {
          setData({
            todaySales: res.data.todaySales || 0,
            weekSales: res.data.weekSales || 0,
            monthSales: res.data.monthSales || 0,
            totalGST: res.data.totalGST || 0,
          });
        }
      } catch (err) {
        message.error("Failed to load dashboard data");
      }
    };
    fetchDashboardData();
  }, []);

  const safeFixed = (val) => Number(val || 0).toFixed(2);

  const cardData = [
    {
      title: "Today's Sales",
      value: safeFixed(data.todaySales),
      prefix: <DollarOutlined className="icon today" />,
      className: "today-sales",
    },
    {
      title: "This Week's Sales",
      value: safeFixed(data.weekSales),
      prefix: <CalendarOutlined className="icon week" />,
      className: "week-sales",
    },
    {
      title: "This Month's Sales",
      value: safeFixed(data.monthSales),
      prefix: <ShoppingCartOutlined className="icon month" />,
      className: "month-sales",
    },
    {
      title: "Total GST (Estimate)",
      value: safeFixed(data.totalGST),
      prefix: <RiseOutlined className="icon gst" />,
      className: "total-gst",
    },
  ];

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-title">Sales & Performance Dashboard</h2>
      <Row gutter={[20, 20]}>
        {cardData.map((card) => (
          <Col xs={24} sm={12} md={6} key={card.title}>
            <Card bordered={false} className={`stat-card ${card.className}`}>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.prefix}
                precision={2}
                valueStyle={{ fontSize: "22px", fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardPage;
