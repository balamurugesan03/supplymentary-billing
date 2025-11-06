import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm,Row,Col} from "antd";
import { addProduct, getProducts, updateProduct,deleteProduct } from "../services/productService";
import "./ProductPage.css";

const ProductPage = () => {
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const fetchProducts = async () => {
    const { data } = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000); // Fetch products every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (editMode) {
        await updateProduct(currentProduct._id, values);
        message.success("Product Updated ✅");
      } else {
        await addProduct(values);
        message.success("Product Added ✅");
      }

      fetchProducts();
      setVisible(false);
      form.resetFields();
      setEditMode(false);

    } catch (error) {
      message.error("Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setCurrentProduct(record);
    form.setFieldsValue(record);
    setVisible(true);
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    message.success("Deleted ✅");
    fetchProducts();
  };

  const columns = [
    { title: "Name", dataIndex: "productName" },
    { title: "Flavour", dataIndex: "flavour" },
    { title: "Quantity", dataIndex: "quantity" },
    { title: "Count", dataIndex: "count" },
    { title: "MRP", dataIndex: "mrp" },
    { title: "Sales Price", dataIndex: "salesPrice" },
    { title: "GST %", dataIndex: "gstPercent" },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="product-page">
      <h2>Product List</h2>

      <Button type="primary" onClick={() => { form.resetFields(); setEditMode(false); setVisible(true); }}>
        + Add Product
      </Button>

     <Table
  columns={columns}
  dataSource={products}
  rowKey="_id"
  bordered
  style={{ marginTop: 20 }}
  pagination={{ pageSize: 5 }} 
/>


     <Modal
  title={editMode ? "Edit Product" : "Add Product"}
  open={visible}
  footer={null}
  onCancel={() => setVisible(false)}
>
  <Form layout="vertical" form={form} onFinish={onFinish}>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item name="productName" label="Product Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="flavour" label="Flavour">
          <Input />
        </Form.Item>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item name="quantity" label="Quantity (Kg / Gram)">
          <Input />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="count" label="Count">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item name="mrp" label="MRP" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="salesPrice" label="Sales Price" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    </Row>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item name="gstPercent" label="GST (%)">
          <InputNumber min={0} max={28} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      {/* You can add another field here if needed */}
      <Col span={12}></Col>
    </Row>

    <Button type="primary" htmlType="submit" loading={loading} block>
      {editMode ? "Update" : "Save"}
    </Button>

  </Form>
</Modal>
    </div>
  );
};

export default ProductPage;
