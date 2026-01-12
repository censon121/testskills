# 理发预约系统 - 前端

原生的 HTML/CSS/JavaScript 前端应用，与 FastAPI 后端集成。

## 项目结构

```
frontend/
├── index.html          # 首页/仪表板
├── customers.html      # 客户管理页面
├── appointments.html   # 预约管理页面
├── css/
│   └── style.css       # 全局样式
├── js/
│   ├── api.js          # API 通信封装
│   ├── dashboard.js    # 仪表板逻辑
│   ├── customers.js    # 客户管理逻辑
│   └── appointments.js # 预约管理逻辑
└── README.md           # 本文件
```

## 使用方法

### 1. 启动后端服务

确保后端服务正在运行：

```bash
cd ..
uvicorn main:app --reload
```

后端将运行在 `http://localhost:8000`

### 2. 打开前端页面

直接在浏览器中打开 HTML 文件：

- `index.html` - 仪表板页面
- `customers.html` - 客户管理页面
- `appointments.html` - 预约管理页面

或者使用本地服务器（推荐）：

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js http-server
npx http-server -p 8080
```

然后访问 `http://localhost:8080`

### 3. CORS 配置

前端默认连接 `http://localhost:8000`。

如果遇到 CORS 问题，请确保后端的 CORS 配置正确（已在 `main.py` 中配置）。

## 功能说明

### 仪表板 (index.html)
- 显示总客户数、总预约数、今日预约、待处理预约
- 显示今日预约列表
- 显示最近预约列表

### 客户管理 (customers.html)
- 查看所有客户
- 添加新客户
- 编辑客户信息
- 删除客户

### 预约管理 (appointments.html)
- 查看所有预约
- 创建新预约
- 编辑预约信息
- 更新预约状态
- 删除预约

## 技术栈

- HTML5
- CSS3 (包含响应式设计)
- Vanilla JavaScript (无框架依赖)

## 浏览器兼容性

支持所有现代浏览器：
- Chrome/Edge (推荐)
- Firefox
- Safari
