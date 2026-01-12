# 理发预约系统设计文档

**日期:** 2025-01-12
**技术栈:** FastAPI + SQLite
**用途:** 个人学习项目

---

## 系统概览与数据模型

### 项目结构
```
barber-booking/
├── main.py           # FastAPI 应用入口，路由注册
├── models.py         # SQLAlchemy 数据模型
├── schemas.py        # Pydantic 请求/响应模型
├── database.py       # SQLite 数据库连接配置
├── requirements.txt  # 项目依赖
└── README.md         # 项目说明
```

### 数据模型

#### Customer（客户）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 主键 |
| name | String | 客户姓名 |
| phone | String (Unique) | 联系电话 |
| created_at | DateTime | 创建时间 |

#### Appointment（预约）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer (PK) | 主键 |
| customer_id | Integer (FK) | 关联客户 |
| date | String | 预约日期 |
| time | String | 预约时间 |
| notes | String | 备注信息（可选） |
| status | String | 状态 |
| created_at | DateTime | 创建时间 |

两个模型通过 `customer_id` 建立一对多关系。

---

## API 端点设计

### 客户管理 API
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | /customers | 创建新客户 |
| GET | /customers | 获取所有客户 |
| GET | /customers/{id} | 获取单个客户 |
| PUT | /customers/{id} | 更新客户 |
| DELETE | /customers/{id} | 删除客户 |

### 预约管理 API
| 方法 | 端点 | 说明 |
|------|------|------|
| POST | /appointments | 创建新预约 |
| GET | /appointments | 获取所有预约 |
| GET | /appointments/{id} | 获取单个预约 |
| PUT | /appointments/{id} | 更新预约 |
| DELETE | /appointments/{id} | 删除预约 |
| GET | /appointments/customer/{customer_id} | 获取客户的所有预约 |

---

## 数据流与交互

### 典型交互流程

1. 创建客户并预约：
```json
// POST /customers
{ "name": "张三", "phone": "13800138000" }

// POST /appointments
{
  "customer_id": 1,
  "date": "2025-01-20",
  "time": "14:30",
  "notes": "剪短发"
}
```

### 数据流
1. 客户端 HTTP 请求 → FastAPI 路由
2. Pydantic 验证 → SQLAlchemy 操作数据库
3. 数据库结果 → JSON 响应
4. 返回客户端

---

## 错误处理

| 错误类型 | 状态码 | 响应 |
|---------|--------|------|
| 资源不存在 | 404 | `{"detail": "Customer not found"}` |
| 验证失败 | 422 | `{"detail": [{"field": "phone", "msg": "Invalid format"}]}` |
| 外键约束 | 400 | `{"detail": "Customer does not exist"}` |
| 服务器错误 | 500 | `{"detail": "Internal server error"}` |

---

## 项目启动

1. 安装依赖：`pip install fastapi uvicorn sqlalchemy pydetic`
2. 启动应用：`uvicorn main:app --reload`
3. 访问文档：`http://localhost:8000/docs`

---

## YAGNI 原则

本项目遵循 YAGNI（You Aren't Gonna Need It）原则，**不实现**：
- 用户认证系统
- 时间冲突检测
- 短信/邮件通知
- 复杂的状态流转
