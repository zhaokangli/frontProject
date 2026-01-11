import { lazy } from "react";
import {
  TransactionOutlined,
  LineChartOutlined,
  TrophyOutlined,
  SnippetsOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

// 懒加载页面组件（也可以直接import）

const Home = lazy(() => import("../pages/home/home"));
const AShareTraining = lazy(() =>
  import("../pages/freeSimulation/AShareTraining")
);
const TransactionRecord = lazy(() =>
  import("../pages/freeSimulation/transactionRecord")
);

const Nav1 = lazy(() => import("../pages/nav1"));
const Nav2 = lazy(() => import("../pages/nav2"));
const Nav3 = lazy(() => import("../pages/nav3"));

// 新增二级菜单对应的懒加载组件
const Nav2Sub1 = lazy(() => import("../pages/nav2Sub1"));
const Nav2Sub2 = lazy(() => import("../pages/nav2Sub2"));

// 路由数组
export const routeConfig = [
  {
    key: "4", // 菜单唯一标识
    path: "/home", // 路由路径
    component: Home, // 对应页面组件
    label: "首页", // 菜单显示文本
    icon: TransactionOutlined,
  },
  {
    key: "5", // 菜单唯一标识
    path: "/freeSimulation", // 路由路
    label: "免费模拟", // 菜单显示文本
    icon: LineChartOutlined,
    children: [
      {
        key: "5-1", // 二级菜单key（需唯一，建议父key+子序号）
        path: "AShareTraining", // 二级路由路径
        component: AShareTraining, // 对应页面组件
        label: "A股随机训练", // 二级菜单显示文本
        icon: TrophyOutlined,
      },
      {
        key: "5-2", // 二级菜单key（需唯一，建议父key+子序号）
        path: "transactionRecord", // 二级路由路径
        component: TransactionRecord, // 对应页面组件
        label: "交易记录", // 二级菜单显示文本
        icon: SnippetsOutlined,
      },
    ],
  },
    {
    key: "1", // 菜单唯一标识
    path: "/nav1", // 路由路径
    component: Nav1, // 对应页面组件
    label: "nav 1", // 菜单显示文本
  },
  {
    key: "2",
    path: "/nav2",
    component: Nav2,
    label: "nav 2",
    // 新增：二级菜单配置
    children: [
      {
        key: "2-1", // 二级菜单key（需唯一，建议父key+子序号）
        path: "sub1", // 二级路由路径
        component: Nav2Sub1, // 二级页面组件
        label: "nav 2 - sub1", // 二级菜单显示文本
      },
      {
        key: "2-2",
        path: "sub2",
        component: Nav2Sub2,
        label: "nav 2 - sub2",
      },
    ],
  },
  {
    key: "3", // 菜单唯一标识
    path: "/nav3", // 路由路径
    component: Nav3, // 对应页面组件
    label: "nav 3", // 菜单显示文本
  },
];

export const defaultRoute = "/home";
