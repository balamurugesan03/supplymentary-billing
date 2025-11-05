import React, { useState } from "react";
import { Table, DatePicker, Button, message, Empty } from "antd";
import { filterPurchasesByDate } from "../services/productService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./PurchaseHistory.css";

const { RangePicker } = DatePicker;

const PurchaseHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "purchaseDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: "Supplier", dataIndex: "supplierName" },
    { title: "Product", render: (_, rec) => rec.productId?.productName || "-" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Total", dataIndex: "totalAmount" },
  ];

  const handleFilter = async (dates) => {
    if (!dates || dates.length !== 2) return;

    setLoading(true);
    try {
      const start = dates[0].startOf("day").format("YYYY-MM-DDTHH:mm:ss");
      const end = dates[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss");

      const response = await filterPurchasesByDate(start, end);
      if (response?.data && response.data.length > 0) {
        setData(response.data);
        setPagination((prev) => ({
          ...prev,
          current: 1,
          total: response.data.length,
        }));
      } else {
        setData([]);
        message.info("No purchases found for selected dates");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to filter purchases");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!data.length) {
      message.warning("No data to export");
      return;
    }

    const doc = new jsPDF();
    doc.text("Purchase History Report", 14, 10);
    autoTable(doc, {
      head: [["Date", "Supplier", "Product", "Qty", "Total"]],
      body: data.map((i) => [
        new Date(i.purchaseDate).toLocaleDateString(),
        i.supplierName,
        i.productId?.productName || "-",
        i.quantity,
        i.totalAmount,
      ]),
      startY: 20,
    });
    doc.save("purchase_history.pdf");
    message.success("PDF exported successfully");
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  return (
    <div className="purchase-history-page">
      <h2>Purchase History</h2>

      <RangePicker onChange={handleFilter} className="range-picker" allowClear />

      <Button
        type="primary"
        onClick={exportPDF}
        disabled={data.length === 0}
        className="export-button"
      >
        Export PDF
      </Button>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        className="table"
        loading={loading}
        locale={{ emptyText: <Empty description="No purchases found" /> }}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default PurchaseHistory;
