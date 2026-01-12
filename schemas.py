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
