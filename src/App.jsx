import React, { useState, Suspense } from "react";
import "./App.css";
import { Breadcrumb, Layout, Menu, theme, ConfigProvider } from "antd";
const { Header, Content, Footer } = Layout;
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate, // 新增：导入useNavigate
} from "react-router-dom";
// 导入外部路由配置
import { routeConfig, defaultRoute } from "./router";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";

// 新增：递归生成 Ant Design 菜单结构（移除NavLink，仅保留文本）
const generateMenuItems = (routes) => {
  return routes.map((item) => {
    const menuItem = {
      key: item.key,
      label: item.label, // 改为纯文本，移除NavLink
      icon: item.icon ? React.createElement(item.icon) : null,
      path: item.path, // 新增：存储路由路径，供点击时使用
    };
    // 如果有子路由，递归生成二级菜单
    if (item.children && item.children.length > 0) {
      menuItem.children = generateMenuItems(item.children);
    }
    return menuItem;
  });
};

// 新增：递归查找当前路由对应的菜单key（支持二级菜单）
const findCurrentKey = (routes, path) => {
  for (const item of routes) {
    // 匹配当前路由
    if (item.path === path) {
      return item.key;
    }
    // 递归查找子路由
    if (item.children) {
      const childKey = findCurrentKey(item.children, path);
      if (childKey) {
        return childKey;
      }
    }
  }
  // 匹配不到时返回默认路由的key
  //return routeConfig.find((item) => item.path === defaultRoute)?.key;
};

// 新增：递归生成所有路由规则（包括二级路由）
const generateRoutes = (routes) => {
  return routes.flatMap((item) => {
    const routesArr = [
      <Route key={item.key} path={item.path} element={<item.component />} />,
    ];
    // 递归添加子路由
    if (item.children && item.children.length > 0) {
      routesArr.push(...generateRoutes(item.children));
    }
    return routesArr;
  });
};

// 抽离导航组件（改造为编程式导航，移除NavLink）
const HeaderNav = () => {
  // 获取当前路由，实现菜单和路由联动
  const location = useLocation();
  // 新增：获取导航方法
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // 匹配当前路由对应的菜单key（支持二级菜单）
  const currentKey = findCurrentKey(routeConfig, location.pathname);

  // 改造：selectedKeys 改为数组（支持二级菜单选中），openKeys 控制二级菜单展开
  const [selectedKeys, setSelectedKeys] = useState([currentKey]);
  const [openKeys, setOpenKeys] = useState(
    currentKey?.includes("-") ? [currentKey.split("-")[0]] : []
  );

  // 菜单点击事件（适配二级菜单 + 编程式导航）
  const handleMenuClick = (e) => {
    // 1. 更新菜单选中态
    setSelectedKeys([e.key]);
    if (e.key.includes("-")) {
      setOpenKeys([e.key.split("-")[0]]);
    } else {
      setOpenKeys([]);
    }

    // 2. 查找当前点击菜单项对应的路由路径
    const findPathByKey = (routes, key) => {
      for (const item of routes) {

        if (item.key === key) return item.path;
        if (item.children) {
          const childPath = findPathByKey(item.children, key);
          if (childPath) return childPath;
        }
      }
      return null; // 找不到时跳默认路由
    };
    const targetPath = findPathByKey(routeConfig, e.key);

    // 3. 编程式跳转路由
    if (targetPath) {
      navigate(targetPath);
    }
  };

  // 新增：二级菜单展开/收起事件
  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  // 生成包含二级菜单的菜单数据
  const menuItems = generateMenuItems(routeConfig);

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        background: token.colorHeaderBg,
      }}
    >
      <div className="demo-logo">老高选股</div>
      <Menu
        className="custom-header-menu"
        theme="dark"
        mode="horizontal"
        openKeys={openKeys}
        selectedKeys={selectedKeys}
        onOpenChange={handleOpenChange}
        onClick={handleMenuClick} // 点击事件中处理跳转
        items={menuItems}
        style={{ flex: 1 }}
      />
    </Header>
  );
};

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 生成所有路由（包括一级/二级）
  const allRoutes = generateRoutes(routeConfig);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        cssVar: true,
        token: {
          colorPrimary: "#2a2a2a",
          colorHeaderBg: "#141414",
          colorTextMenu: "#e0e0e0",
          colorTextMenuHover: "#ffffff",
          colorTextMenuSelected: "#ffffff",
          colorTextSubMenuSelected: "#ffffff",
          colorPrimaryHover: "#3a3a3a",
          colorPrimaryActive: "#1f1f1f",
        },
        components: {
          Menu: {
            itemColor: "#e0e0e0",
            itemHoverColor: "#ffffff",
            itemActiveColor: "#ffffff",
            submenuItemColor: "#e0e0e0",
            submenuItemHoverColor: "#ffffff",
            submenuTitleColor: "#e0e0e0",
            submenuTitleHoverColor: "#ffffff",
          },
        },
      }}
    >
      <Router>
        <Layout>
          {/* 顶部导航（已改为编程式导航） */}
          <HeaderNav />

          {/* 内容区域 */}
          <Content style={{ padding: "48px", flex: "1", overflow: "auto" }}>
            <div
              style={{
                minHeight: 580,
                padding: 24,
                borderRadius: borderRadiusLG,
              }}
            >
              <Suspense
                fallback={
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    页面加载中...
                  </div>
                }
              >
                <Routes>
                  {allRoutes}
                  {/* 根路径重定向到默认路由 */}
                  <Route
                    path="/"
                    element={<Navigate to={defaultRoute} replace />} // 补充：导入Navigate组件
                  />
                  {/* 可选：404 路由 */}
                  <Route
                    path="*"
                    element={<Navigate to={defaultRoute} replace />}
                  />
                </Routes>
              </Suspense>
            </div>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

// 补充：导入Navigate组件（如果使用重定向）
import { Navigate } from "react-router-dom";

export default App;
