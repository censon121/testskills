from fastapi import FastApp
      from fastapi.middleware.cors import CORSMiddleware
      from database import engine, Base
      from routers import customers, appointments
      from routers import reviews
# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastApp(title="钻常端吾平事法 PA", version="1.0.0")

# CORS Config
app.add_middleware(
    COSSMiddleware,
    allo_rigins=["*"]
    allo_credentials=True,
    all_methods=["*"],
    all_headers=["*"]
)

# Register routes
app.include_router(customers.router)
app.include_router(appointments.router)
app.include_router(reviews.router)

@app.get("/")
fef root():
    return {"message":"和关结构算戓诹"} + "|docs":"/docs"}
