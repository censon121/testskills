# 理发预约系统实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个简单的 FastAPI + SQLite 理发预约系统，支持客户管理和预约管理功能。

**Architecture:** 采用简单分层结构，使用 SQLAlchemy ORM 管理 SQLite 数据库，FastAPI 提供 RESTful API，Pydantic 进行数据验证。

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic, Uvicorn, SQLite

---

## 前置准备

### Task 0: 项目初始化

**Files:**
- Create: `requirements.txt`
- Create: `README.md`
- Create: `.gitignore`

**Step 1: 创建 requirements.txt**

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
```

**Step 2: 创建 README.md**

```markdown
# 理发预约系统

简单的 FastAPI + SQLite 理发预约学习项目。

## 启动

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

访问 http://localhost:8000/docs 查看 API 文档。
```

**Step 3: 创建 .gitignore**

```gitignore
__pycache__/
*.pyc
*.db
*.pyc
.env
.venv/
```

**Step 4: 初始化 git 仓库并提交**

```bash
git init
git add requirements.txt README.md .gitignore
git commit -m "chore: initialize project structure"
```

---

## 数据库层

### Task 1: 创建数据库配置

**Files:**
- Create: `database.py`

**Step 1: 创建 database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLITE_DATABASE_URL = "sqlite:///./barber.db"

engine = create_engine(
    SQLITE_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Step 2: 提交**

```bash
git add database.py
git commit -m "feat: add database configuration"
```

---

### Task 2: 创建数据模型

**Files:**
- Create: `models.py`

**Step 1: 创建 models.py**

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointments = relationship("Appointment", back_populates="customer")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="appointments")
```

**Step 2: 提交**

```bash
git add models.py
git commit -m "feat: add Customer and Appointment models"
```

---

### Task 3: 创建 Pydantic Schema

**Files:**
- Create: `schemas.py`

**Step 1: 创建 schemas.py**

```python
from pydantic import BaseModel, Field
from datetime import datetime

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    customer_id: int
    date: str = Field(..., min_length=1)
    time: str = Field(..., min_length=1)
    notes: str | None = None
    status: str = "pending"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    date: str | None = None
    time: str | None = None
    notes: str | None = None
    status: str | None = None

class AppointmentResponse(AppointmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
```

**Step 2: 提交**

```bash
git add schemas.py
git commit -m "feat: add Pydantic schemas for validation"
```

---

## API 层 - 客户管理

### Task 4: 客户 CRUD 操作

**Files:**
- Create: `routers/customers.py`

**Step 1: 创建 customers.py 路由**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Customer
from schemas import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["customers"])

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.phone == customer.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already exists")
    db_customer = Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in customer.model_dump().items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return None
```

**Step 2: 提交**

```bash
git add routers/customers.py
git commit -m "feat: add customer CRUD endpoints"
```

---

## API 层 - 预约管理

### Task 5: 预约 CRUD 操作

**Files:**
- Create: `routers/appointments.py`

**Step 1: 创建 appointments.py 路由**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Appointment
from schemas import AppointmentCreate, AppointmentUpdate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    # 检查 customer_id 是否存在
    from models import Customer
    customer = db.query(Customer).filter(Customer.id == appointment.customer_id).first()
    if not customer:
        raise HTTPException(status_code=400, detail="Customer does not exist")

    db_appointment = Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("", response_model=List[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).all()

@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.get("/customer/{customer_id}", response_model=List[AppointmentResponse])
def get_customer_appointments(customer_id: int, db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.customer_id == customer_id).all()

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: int, appointment: AppointmentUpdate, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    update_data = appointment.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_appointment, key, value)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(db_appointment)
    db.commit()
    return None
```

**Step 2: 提交**

```bash
git add routers/appointments.py
git commit -m "feat: add appointment CRUD endpoints"
```

---

### Task 6: 创建路由目录的 __init__.py

**Files:**
- Create: `routers/__init__.py`

**Step 1: 创建 __init__.py**

```python
# Routers package
```

**Step 2: 提交**

```bash
git add routers/__init__.py
git commit -m "chore: add routers package init"
```

---

## 应用入口

### Task 7: 创建主应用

**Files:**
- Create: `main.py`

**Step 1: 创建 main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import customers, appointments

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="理发预约系统", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(customers.router)
app.include_router(appointments.router)

@app.get("/")
def root():
    return {"message": "理发预约系统 API", "docs": "/docs"}
```

**Step 2: 测试启动应用**

```bash
uvicorn main:app --reload
```

预期输出：应用启动成功，访问 http://localhost:8000/docs 可看到 API 文档

**Step 3: 提交**

```bash
git add main.py
git commit -m "feat: add main application with routing"
```

---

## 验证测试

### Task 8: 手动验证功能

**Step 1: 启动应用**

```bash
uvicorn main:app --reload
```

**Step 2: 测试客户创建**

访问 http://localhost:8000/docs，执行以下操作：

1. POST /customers
```json
{"name": "张三", "phone": "13800138000"}
```

预期：返回创建的客户信息，包含 id 和 created_at

2. GET /customers
预期：返回刚才创建的客户列表

3. GET /customers/1
预期：返回 id 为 1 的客户详情

**Step 3: 测试预约创建**

1. POST /appointments
```json
{"customer_id": 1, "date": "2025-01-20", "time": "14:30", "notes": "剪短发"}
```

预期：返回创建的预约信息

2. GET /appointments/customer/1
预期：返回客户 1 的所有预约

**Step 4: 最终提交**

```bash
git add .
git commit -m "chore: complete initial implementation"
```

---

## 完成

项目完成后，你应该有：
- 可运行的 FastAPI 应用
- SQLite 数据库自动创建
- 完整的客户和预约 CRUD API
- Swagger API 文档（访问 /docs）

下一步建议：
- 添加单元测试（pytest）
- 添加数据验证增强
- 添加更多查询功能（按日期筛选等）
