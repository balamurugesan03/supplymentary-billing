import React, { useState, useEffect } from "react";
import { Table, DatePicker, Button, message, Modal, Input } from "antd";
import { getBills, filterBills, sendBillEmail } from "../services/productService";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./BillingHistoryPage.css";

const { RangePicker } = DatePicker;

const BillingHistoryPage = () => {
  const [bills, setBills] = useState([]);
  const [range, setRange] = useState([]);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await getBills();
      setBills(res.data);
    } catch (error) {
      message.error("Failed to fetch bills");
    }
  };

  const handleFilter = async () => {
    if (range.length === 2) {
      const start = range[0].format("YYYY-MM-DD");
      const end = range[1].format("YYYY-MM-DD");
      try {
        const res = await filterBills(start, end);
        setBills(res.data);
      } catch (error) {
        message.error("Error filtering bills");
      }
    } else {
      message.warning("Please select a date range");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Billing History", 80, 10);
    const tableData = bills.map((b) => [
      b.billNo,
      b.customerName || "-",
      new Date(b.date).toLocaleDateString(),
      b.items?.length || 0,
      `₹ ${(b.grandTotal || 0).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: 20,
      head: [["Bill No", "Customer", "Date", "Items", "Total"]],
      body: tableData,
    });
    doc.save("Billing_History.pdf");
  };

  const printInvoice = (bill) => {
    const doc = new jsPDF();
    doc.text("INVOICE", 90, 10);
    doc.text(`Bill No: ${bill.billNo}`, 14, 20);
    doc.text(`Customer: ${bill.customerName}`, 14, 28);
    doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 14, 36);

    const tableData =
      bill.items?.map((i) => [
        i.product?.productName || "-",
        i.qty || 0,
        i.price?.toFixed(2) || 0,
        i.gst || 0,
        (i.total || 0).toFixed(2),
      ]) || [];

    doc.autoTable({
      head: [["Product", "Qty", "Price", "GST %", "Total"]],
      body: tableData,
      startY: 45,
    });

    const finalY = doc.lastAutoTable.finalY || 60;
    doc.text(`Grand Total: ₹ ${(bill.grandTotal || 0).toFixed(2)}`, 150, finalY + 10);
    doc.save(`Invoice_${bill.billNo}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      return message.error("Please enter a recipient email");
    }

    try {
      await sendBillEmail(selectedBill._id, recipientEmail);
      message.success("Email sent successfully");
      setEmailModalVisible(false);
      setRecipientEmail("");
    } catch (error) {
      message.error("Failed to send email");
    }
  };

  const columns = [
    { title: "Bill No", dataIndex: "billNo" },
    { title: "Customer", dataIndex: "customerName" },
    {
      title: "Date",
      render: (r) => new Date(r.date).toLocaleDateString(),
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      render: (v) => `₹ ${(v || 0).toFixed(2)}`,
    },
    {
      title: "Action",
      render: (r) => (
        <>
          <Button type="link" onClick={() => printInvoice(r)}>
            🖨 Print
          </Button>
          <Button
            type="link"
            onClick={() => {
              setSelectedBill(r);
              setEmailModalVisible(true);
            }}
          >
            📧 Send Email
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="billing-history-page">
      <h2>Billing History</h2>

      <div className="filter-section">
        <RangePicker onChange={(values) => setRange(values)} />
        <Button onClick={handleFilter} className="filter-button">
          Filter
        </Button>
        <Button onClick={exportPDF} className="export-button">
          Export PDF
        </Button>
      </div>

      <Table
        dataSource={bills}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title="Send Bill via Email"
        open={emailModalVisible}
        onOk={handleSendEmail}
        onCancel={() => setEmailModalVisible(false)}
      >
        <Input
          placeholder="Enter recipient email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default BillingHistoryPage;
