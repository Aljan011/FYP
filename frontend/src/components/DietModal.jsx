import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import "../css/PlanModal.css"; // reuse plan modal styling

const DietModal = ({ receiverId, authToken, onClose }) => {
  const [dietTypes, setDietTypes] = useState([]);
  const [selectedDietId, setSelectedDietId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/diet-types/", {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      })
      .then((res) => {
        setDietTypes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load diet types", err);
        setError("Failed to load diet types");
        setLoading(false);
      });
  }, [authToken]);

  const handleAssign = async () => {
    if (!selectedDietId) return alert("Please select a diet type");

    setAssigning(true);
    try {
      // Step 1: Assign the diet
      const assignRes = await axiosInstance.post(
        "/assigned-diets/",
        {
          user: receiverId,
          diet_type: selectedDietId,
          notes,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      const assignedId = assignRes.data.id;

      // Step 2: Send it via chat (make sure this endpoint exists)
      await axiosInstance.post(
        `/assigned-diets/${assignedId}/send/`,
        {},
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      alert("🥗 Diet plan assigned and sent!");
      onClose();
    } catch (error) {
      console.error("Error assigning diet:", error);
      alert("Failed to assign diet");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>🥗 Assign Diet Plan</h2>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p>Loading diet types...</p>
        ) : (
          <select
            value={selectedDietId}
            onChange={(e) => setSelectedDietId(e.target.value)}
          >
            <option value="">-- Select Diet Type --</option>
            {dietTypes.map((diet) => (
              <option key={diet.id} value={diet.id}>
                {diet.diet.name} — {diet.name}
              </option>
            ))}
          </select>
        )}

        <textarea
          rows={4}
          placeholder="Optional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="modal-actions">
          <button
            onClick={handleAssign}
            disabled={assigning || !selectedDietId}
          >
            {assigning ? "Assigning..." : "✅ Assign & Send"}
          </button>
          <button className="cancel-btn" onClick={onClose} disabled={assigning}>
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DietModal;
