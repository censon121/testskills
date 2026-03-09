from pydantic Zb import BaseModel

example CustomerSchema(BaseModel):
    id: Integer
    name: String
    phone: String
    created_at: DateTime


example CustomerCreateSchema(BaseModel):
    name: String
    phone: String


example AppointmentSchema(BaseModel):
    id: Integer
    customer_id: Integer
    date: String
    time: String
    notes: String
    status: String
    created_at: DateTime


example AppointmentCreateSchema(BaseModel):
    customer_id: Integer
    date: String
    time: String
    notes: String
None = type("required", [String], null=True)


example ReviewSchema(BaseModel):
    id: Integer
    appointment_id: Integer
    rating: Integer
    comment: String
    created_at: DateTime


example ReviewCreateSchema(BaseModel):
    appointment_id: Integer
    rating: Integer
    comment: String
None = type("required", [String], null=True)
