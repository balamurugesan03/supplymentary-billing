import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Select,
  Table,
  Modal,
  message,
  Popconfirm,
} from "antd";
import dayjs from "dayjs";
import {
  addPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase,
  getProducts,
} from "../services/productService";
import "./PurchasePage.css";

const PurchasePage = () => {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  useEffect(() => {
    loadProducts();
    loadPurchases();
  }, []);

  const loadProducts = async () => {
    const { data } = await getProducts();
    setProducts(data);
  };

  const loadPurchases = async () => {
    const { data } = await getPurchases();
    setPurchases(data);
    setPagination((prev) => ({
      ...prev,
      total: data.length,
    }));
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      values.purchaseDate = dayjs(values.purchaseDate).toDate();
      values.expiryDate = values.expiryDate
        ? dayjs(values.expiryDate).toDate()
        : null;
      await addPurchase(values);
      message.success("Purchase Added & Stock Updated ✅");
      form.resetFields();
      setAddModal(false);
      loadPurchases();
    } catch {
      message.error("Error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setCurrentPurchase(record);
    editForm.setFieldsValue({
      ...record,
      purchaseDate: record.purchaseDate ? dayjs(record.purchaseDate) : null,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
      productId: record.productId?._id,
    });
    setEditModal(true);
  };

  const saveEdit = async (values) => {
    try {
      await updatePurchase(currentPurchase._id, values);
      message.success("Updated ✅");
      setEditModal(false);
      loadPurchases();
    } catch {
      message.error("Failed ❌");
    }
  };

  const handleDelete = async (id) => {
    await deletePurchase(id);
    message.success("Deleted ✅");
    loadPurchases();
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const columns = [
    { title: "Supplier", dataIndex: "supplierName" },
    { title: "Invoice No", dataIndex: "invoiceNumber" },
    {
      title: "Product",
      key: "product",
      render: (_, record) => {
        const name = record.productId?.productName || "-";
        const flavour = record.productId?.flavour
          ? ` - ${record.productId.flavour}`
          : "";
        return name + flavour;
      },
    },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Price", dataIndex: "unitPrice" },
    { title: "Total", dataIndex: "totalAmount" },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="purchase-page">
      <h2>Purchase Entry</h2>

      <Button
        type="primary"
        onClick={() => setAddModal(true)}
        className="add-purchase-button"
      >
        + Add Purchase
      </Button>

      {/* ✅ Table with pagination */}
      <Table
        columns={columns}
        dataSource={purchases}
        rowKey="_id"
        bordered
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* ADD PURCHASE MODAL */}
      <Modal
        title="Add Purchase"
        open={addModal}
        onCancel={() => setAddModal(false)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onValuesChange={(changedValues, allValues) => {
            if (changedValues.products) {
              const total = allValues.products.reduce((acc, curr) => {
                const quantity = curr?.quantity || 0;
                const unitPrice = curr?.unitPrice || 0;
                return acc + quantity * unitPrice;
              }, 0);
              form.setFieldsValue({ totalAmount: total });
            }
          }}
        >
          <div className="form-grid">
            <Form.Item
              name="supplierName"
              label="Supplier Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="invoiceNumber"
              label="Invoice Number"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="purchaseDate"
              label="Purchase Date"
              rules={[{ required: true }]}
            >
              <DatePicker className="full-width" />
            </Form.Item>

            <Form.Item name="gstPercent" label="GST %">
              <InputNumber min={0} max={28} className="full-width" />
            </Form.Item>
          </div>

          {/* Product List */}
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="product-row">
                    <Form.Item
                      {...restField}
                      name={[name, "productId"]}
                      rules={[{ required: true, message: "Select a product" }]}
                      className="product-item"
                    >
                      <Select placeholder="Select Product" className="product-select">
                        {products.map((p) => (
                          <Select.Option value={p._id} key={p._id}>
                            {p.productName} {p.flavour && `- ${p.flavour}`}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Enter Qty" }]}
                      className="product-item"
                    >
                      <InputNumber placeholder="Qty" min={1} className="qty-input" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "unitPrice"]}
                      rules={[{ required: true, message: "Enter Price" }]}
                      className="product-item"
                    >
                      <InputNumber
                        placeholder="Price"
                        min={0}
                        className="price-input"
                      />
                    </Form.Item>

                    <Button
                      type="text"
                      danger
                      onClick={() => remove(name)}
                      className="remove-btn"
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    + Add Product
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            name="totalAmount"
            label="Total Amount"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} className="full-width" disabled />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Save Purchase
          </Button>
        </Form>
      </Modal>

      {/* EDIT PURCHASE MODAL */}
      <Modal
        title="Edit Purchase"
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => editForm.submit()}
      >
        <Form layout="vertical" form={editForm} onFinish={saveEdit}>
          <Form.Item name="quantity" label="Quantity">
            <InputNumber min={1} className="full-width" />
          </Form.Item>
          <Form.Item name="unitPrice" label="Unit Price">
            <InputNumber min={0} className="full-width" />
          </Form.Item>
          <Form.Item name="totalAmount" label="Total Amount">
            <InputNumber min={0} className="full-width" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchasePage;
