import React from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import "./AppLayout.css";

const { Sider, Header, Content } = Layout;

const AppLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible>
        <div className="logo">
          Billing POS
        </div>

        <Menu theme="dark" mode="inline">
          <Menu.Item key="1">
  <Link to="/dashboard">Dashboard</Link>
</Menu.Item>
          <Menu.Item icon={<AppstoreOutlined />} key="2">
            <Link to="/products">Products</Link>
          </Menu.Item>

          <Menu.Item icon={<ShoppingCartOutlined />} key="3">
            <Link to="/billing">Billing</Link>
          </Menu.Item>
          <Menu.Item icon={<ShoppingCartOutlined />} key="4">
  <Link to="/purchase">Purchase</Link>
</Menu.Item>
<Menu.Item key="5">
  <Link to="/purchase-history">Purchase History</Link>
</Menu.Item>
<Menu.Item key="6">
  <Link to="/billing-history">Billing History</Link>
</Menu.Item>



        </Menu>
      </Sider>

      {/* Content */}
      <Layout>
        <Header className="header"> </Header>
        <Content className="content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
