// frontend/pages/BillingPage.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, InputNumber, Select, message, Input, Form } from "antd";
import { getProducts, addBill } from "../services/productService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./BillingPage.css";

const BillingPage = () => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [billItems, setBillItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [customer, setCustomer] = useState("");
  const [billNo, setBillNo] = useState("");

  // ✅ Fetch product list
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      message.error("Failed to load products");
    }
  };

  // ✅ Add product to bill
  const addToBill = () => {
    if (!selectedProduct) return message.error("Select a product");

    const itemTotal = selectedProduct.salesPrice * qty;
    const gstAmount = (itemTotal * selectedProduct.gstPercent) / 100;
    const finalAmount = itemTotal + gstAmount;

    const newItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.productName,
      flavour: selectedProduct.flavour || "",
      quantity: qty,
      price: selectedProduct.salesPrice,
      gstPercent: selectedProduct.gstPercent,
      gstAmount,
      total: finalAmount,
    };

    const updatedItems = [...billItems, newItem];
    setBillItems(updatedItems);
    updateTotal(updatedItems);
  };

  const updateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + item.total, 0);
    setGrandTotal(sum);
  };

  // ✅ Print Bill PDF
  const printBill = (billData) => {
    if (!billData) {
      console.error("❌ No bill data to print");
      return;
    }

   // ✅ Create PDF
const doc = new jsPDF();

doc.setFontSize(18);
doc.text("🧾 Invoice", 14, 20);

doc.setFontSize(12);
doc.text(`Bill No: ${billData.billNo}`, 14, 30);
doc.text(`Customer: ${billData.customerName}`, 14, 37);
doc.text(`Date: ${new Date(billData.date).toLocaleDateString()}`, 14, 44);

const tableColumn = ["Product", "Qty", "Price", "GST %", "Total"];
const tableRows = billData.items.map((item) => [
  item.productName || item.product?.productName || "-",
  item.qty || item.quantity || 0,
  `₹ ${(item.price || 0).toFixed(2)}`,
  `${item.gst || item.gstPercent || 0}%`,
  `₹ ${(item.total || 0).toFixed(2)}`,
]);

// ✅ Correct usage of autoTable
autoTable(doc, {
  head: [tableColumn],
  body: tableRows,
  startY: 55,
});

const finalY = doc.lastAutoTable?.finalY || 60;
doc.setFontSize(14);
doc.text(
  `Grand Total: ₹ ${(billData.grandTotal || 0).toFixed(2)}`,
  14,
  finalY + 10
);

doc.save(`Bill_${billData.billNo}.pdf`);


    // ✅ Trigger print automatically if USB printer connected
    if (window.navigator && window.navigator.pdfViewerEnabled === false) {
      window.print();
    }
  };

  // ✅ Save Bill to DB
  const saveBill = async () => {
    if (!billNo.trim()) return message.error("Enter Bill Number");
    if (!customer.trim()) return message.error("Enter Customer Name");
    if (billItems.length === 0) return message.error("Add items to bill");

    try {
      const formattedItems = billItems.map((item) => ({
        product: item.productId,
        qty: item.quantity,
        price: item.price,
        gst: item.gstPercent,
        total: item.total,
      }));

      const billData = {
        billNo,
        customerName: customer,
        items: formattedItems,
        grandTotal,
      };

      const response = await addBill(billData);
      message.success("Bill Saved Successfully ✅");

      // ✅ Print immediately
      printBill(response.data);

      // ✅ Reset all fields
      setBillItems([]);
      setGrandTotal(0);
      setCustomer("");
      setBillNo("");
      setSelectedProduct(null);
      setQty(1);
      form.resetFields();

      document.querySelector('input[placeholder="Bill No"]').focus();
    } catch (err) {
      console.error(err);
      message.error("Saving Bill Failed ❌");
    }
  };

  const columns = [
    { title: "Product", dataIndex: "productName" },
    { title: "Flavour", dataIndex: "flavour" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Price", dataIndex: "price" },
    { title: "GST %", dataIndex: "gstPercent" },
    { title: "GST Amt", dataIndex: "gstAmount" },
    { title: "Total", dataIndex: "total" },
  ];

  return (
    <div className="billing-page">
      <h2>Billing</h2>

      <Input
        placeholder="Bill No"
        value={billNo}
        onChange={(e) => setBillNo(e.target.value)}
        className="customer-input"
      />

      <Input
        placeholder="Customer Name"
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
        className="customer-input"
      />

      <Form form={form} layout="inline">
        <Form.Item
          name="productId"
          label="Product Name"
          rules={[{ required: true, message: "Select a product" }]}
        >
          <Select
            placeholder="Select Product"
            showSearch
            className="product-select"
            onChange={(value) => {
              const product = products.find((p) => p._id === value);
              setSelectedProduct(product);
            }}
          >
            {products.map((p) => (
              <Select.Option value={p._id} key={p._id}>
                {p.productName} {p.flavour && `- ${p.flavour}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Qty">
          <InputNumber
            min={1}
            value={qty}
            onChange={(value) => setQty(value)}
            className="qty-input"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={addToBill}>
            Add
          </Button>
        </Form.Item>
      </Form>

      <Table
        dataSource={billItems}
        columns={columns}
        rowKey="productId"
        className="table"
        pagination={false}
      />

      <h2 className="grand-total">Grand Total: ₹ {grandTotal.toFixed(2)}</h2>

      <Button type="primary" onClick={saveBill} block className="save-button">
        Save & Print Bill
      </Button>
    </div>
  );
};

export default BillingPage;
