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

  // ✅ Define table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "purchaseDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    { title: "Supplier", dataIndex: "supplierName" },
    { title: "Product", dataIndex: "productName" },
    { title: "Qty", dataIndex: "quantity" },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (val) => val?.toFixed(2),
    },
  ];

  // ✅ Handle date range filter
  const handleFilter = async (dates) => {
    if (!dates || dates.length !== 2) return;

    setLoading(true);
    try {
      const start = dates[0].startOf("day").toISOString();
      const end = dates[1].endOf("day").toISOString();

      const response = await filterPurchasesByDate(start, end);

      if (response?.data && response.data.length > 0) {
        // ✅ Flatten nested products array
        const flatData = response.data.flatMap((purchase) =>
          purchase.products.map((prod) => ({
            _id: purchase._id + "-" + (prod.productId?._id || Math.random()),
            purchaseDate: purchase.purchaseDate,
            supplierName: purchase.supplierName,
            productName: prod.productId?.productName || "-",
            quantity: prod.quantity,
            totalAmount: prod.totalAmount,
          }))
        );

        setData(flatData);
        setPagination((prev) => ({
          ...prev,
          current: 1,
          total: flatData.length,
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

  // ✅ Export to PDF
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
        i.productName,
        i.quantity,
        i.totalAmount?.toFixed(2),
      ]),
      startY: 20,
    });
    doc.save("purchase_history.pdf");
    message.success("PDF exported successfully");
  };

  // ✅ Handle table pagination change
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  return (
    <div className="purchase-history-page">
      <h2>Purchase History</h2>

      <div className="filter-bar">
        <RangePicker
          onChange={handleFilter}
          className="range-picker"
          allowClear
        />
        <Button
          type="primary"
          onClick={exportPDF}
          disabled={data.length === 0}
          className="export-button"
        >
          Export PDF
        </Button>
      </div>

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
