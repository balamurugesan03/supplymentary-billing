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

  const [addModal, setAddModal] = useState(false);

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
      const payload = {
        ...values,
        purchaseDate: dayjs(values.purchaseDate).toDate(),
      };
      await addPurchase(payload);
      message.success("Purchase Added ✅");
      form.resetFields();
      setAddModal(false);
      loadPurchases();
    } catch (err) {
      console.error(err);
      message.error("Error ❌");
    } finally {
      setLoading(false);
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
      title: "Purchase Date",
      dataIndex: "purchaseDate",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
    },
    { title: "Total Amount", dataIndex: "totalAmount" },
    {
      title: "Actions",
      render: (_, record) => (
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
          <Button type="link" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const innerColumns = [
      {
        title: "Product",
        render: (_, item) =>
          `${item.productId?.productName || "-"} ${
            item.productId?.flavour ? `(${item.productId.flavour})` : ""
          }`,
      },
      { title: "Qty", dataIndex: "quantity" },
      { title: "Unit Price", dataIndex: "unitPrice" },
      { title: "GST %", dataIndex: "gstPercent" },
      { title: "Total", dataIndex: "totalAmount" },
    ];

    return (
      <Table
        columns={innerColumns}
        dataSource={record.products}
        pagination={false}
        rowKey={(p) => p._id}
        size="small"
      />
    );
  };

  return (
    <div className="purchase-page">
      <h2>📦 Purchase Entry</h2>

      <Button
        type="primary"
        onClick={() => setAddModal(true)}
        className="add-purchase-button"
      >
        + Add Purchase
      </Button>

      <Table
        columns={columns}
        dataSource={purchases}
        rowKey="_id"
        bordered
        expandable={{ expandedRowRender }}
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
          onValuesChange={(changed, allValues) => {
            if (changed.products) {
              const total = (allValues.products || []).reduce((acc, curr) => {
                const qty = curr?.quantity || 0;
                const price = curr?.unitPrice || 0;
                const gst = (price * qty * (curr?.gstPercent || 0)) / 100;
                return acc + qty * price + gst;
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

            <Form.Item name="gstPercent" label="Default GST %">
              <InputNumber min={0} max={28} className="full-width" />
            </Form.Item>
          </div>

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
                      <Select
                        placeholder="Select Product"
                        className="product-select"
                      >
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
                      <InputNumber placeholder="Qty" min={1} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "unitPrice"]}
                      rules={[{ required: true, message: "Enter Price" }]}
                      className="product-item"
                    >
                      <InputNumber placeholder="Price" min={0} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "gstPercent"]}
                      className="product-item"
                    >
                      <InputNumber placeholder="GST %" min={0} max={28} />
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
    </div>
  );
};

export default PurchasePage;
