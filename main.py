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
