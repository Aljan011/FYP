import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import '../css/TrainerDetail.css';

function TrainerDetail() {
  const { trainerId } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
  console.log("Fetching trainer detail for:", trainerId);
 fetch(`/api/trainers/${trainerId}/detail/`)
  .then((res) => {
    if (!res.ok) {
      return res.text().then(text => {
        console.error("Server error (not JSON):", text);
        throw new Error("Non-JSON server response");
      });
    }
    return res.json();
  })
  .then((data) => {
    console.log("Trainer detail:", data);
    setTrainer(data.trainer);
    setReviews(data.reviews);
    setAverageRating(data.average_rating);
  })
  .catch((err) => {
    console.error("Error loading trainer detail:", err);
  });
}, [trainerId]);

  if (!trainer) return <p>Loading trainer details...</p>;

  const handleSubmitReview = () => {
  if (newRating === 0 || comment.trim() === "") {
    setSubmitError("Please provide a rating and a comment.");
    return;
  }

  setSubmitting(true);
  setSubmitError("");

  fetch(`/api/trainers/${trainerId}/reviews/post/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${localStorage.getItem("authToken")}`, // ensure this token is stored on login
    },
    body: JSON.stringify({
      rating: newRating,
      comment: comment,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
  if (data.error) {
    setSubmitError(data.error);
  } else {
    // Refresh full trainer details including updated avg rating and reviews
    fetch(`/api/trainers/${trainerId}/detail/`)
      .then((res) => res.json())
      .then((updated) => {
        setTrainer(updated.trainer);
        setReviews(updated.reviews);
        setAverageRating(updated.average_rating);
      });

    // Reset form
    setNewRating(0);
    setComment("");
  }
})
    .catch(() => {
      setSubmitError("Something went wrong.");
    })
    .finally(() => {
      setSubmitting(false);
    });
};


  return (
    
    <div className="trainer-detail-container">
        <button onClick={() => navigate(-1)} className="back-btn">
  ← Back
</button>

      <div className="trainer-header">
        <img
          src={trainer.profile_picture || "/default-avatar.png"}
          alt={trainer.username}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{trainer.username}</h2>
          <p className="text-yellow-500 flex items-center gap-1">
            <FaStar className="text-yellow-400" /> {averageRating.toFixed(1)} / 5
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Bio</h3>
        <p>{trainer.bio || "No bio available."}</p>

        <h3 className="mt-4 font-semibold">Experience</h3>
        <p>{trainer.experience_years || 0} years</p>

        <h3 className="mt-4 font-semibold">Specialties</h3>
        <p>{trainer.specialties || "Not provided."}</p>

        <h3 className="mt-4 font-semibold">Certifications</h3>
        <p>{trainer.certifications || "Not provided."}</p>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold">Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border p-3 mt-2 rounded">
              <p className="font-semibold">{r.reviewer}</p>
              <p className="text-yellow-500">⭐ {r.rating} / 5</p>
              <p className="text-sm">{r.comment}</p>
            </div>
          ))
        )}
      </div>
      <div className="review-form">
  <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>

  <div className="star-row">
    {[1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        onClick={() => setNewRating(star)}
        className={`star-icon ${newRating >= star ? "filled" : ""}`}
      />
    ))}
  </div>

  <textarea
    className="review-textarea"
    rows="4"
    placeholder="Write your review..."
    value={comment}
    onChange={(e) => setComment(e.target.value)}
  />

  {submitError && <p className="error-msg">{submitError}</p>}

  <button
    disabled={submitting}
    onClick={handleSubmitReview}
    className="submit-btn"
  >
    {submitting ? "Submitting..." : "Submit Review"}
  </button>
</div>
    </div>
  );
}

export default TrainerDetail;
