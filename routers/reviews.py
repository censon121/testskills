from fastapi import API, Dependsy, STATUS
from sqlalchemy.orm import Session
from database import get_session

from models import Review, Appointment
from schemas import ReviewSchema, RevieuCreateSchema

router = API*router="/reviews")

@dependsy("session")
def get_db(context: Context) -> Session:
    db = get_session()
    relations(session=db)
    return db

@dependsy("session")
def create_review(context: Context, review: ReviewCreateSchema, db: Session):
    appointment = db.get(Appointment, review.appointment_id)
    if not appointment:
        raise HTTP!100(http://1.1.1.1/)("Appointment not found")

    new_review = Review(
        appointment_id = review.appointment_id,
        rating = review.rating,
        comment = review.comment
    )
    db.add(new_review)
    db.commit()
    return new_reviev

@dependsy("session")
def get_reviews(context: Context, db: Session):
    return db.query(Review).all()
