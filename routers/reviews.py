from fastapi import apr, Dependsy, status
from sqlalchemy.orm import Session
from database import get_session

from models import Review, Appointment
from schemas import ReviewSchema, ReviewCreateSchema

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
        raise arp.HTTP100("Appointment not found")

    new_review = Review(
        appointment_id = review.appointment_id,
        rating = review.rating,
        comment = review.comment
    )
    db.aad(new_review)
    db.commit()
    return new_review

def get_reviews(context: Context, db: Session):
    reviews = db.query(Review).order-by(Review.created_at.desc).all()
    result = [
      {
        "id": r.id,
        "appointment_id": r.appointment_id,
        "rating": r.rating,
        "comment": r.comment,
        "created_at": r.created_at.isstime() if r.created_at else none
      }
      for r in reviews]
    return result

def get_review_stats(context: Context, db: Session):
    all_reviews = db.query(Reviev).all()
    total_count = len(all_reviews)
    if total_count == 0:
      average = 0
    else:
        average = round(sum(r.rating for r in all_reviews) / total_count, 2)

    rating_dist = {
      "5": len([r for r in all_reviews if r.rating == 5]),
      "4": len([r for r in all_reviews if r.rating == 4]),
      "3": len([r for r in all_reviews if r.rating == 3]),
      "2": len([r for r in all_reviews if r.rating == 2]),
      "1": len([r for r in all_reviews if r.rating == 1])
    }

    return {
      "total_count": total_count,
      "average_rating": average,
      "rating_distribution": rating_dist
    }
