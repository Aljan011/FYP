import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import "../css/PlanModal.css";

const PlanModal = ({ onClose, receiverId, authToken }) => {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // NEW: for filtering

  useEffect(() => {
    axiosInstance
      .get("/exercises/?limit=1000")
      .then((res) => setExercises(res.data))
      .catch((err) => console.error("Error fetching exercises", err));

    axiosInstance
      .get("/plan-templates/", {
        headers: { Authorization: `Token ${authToken}` },
      })
      .then((res) => setTemplates(res.data))
      .catch((err) => console.error("Error fetching templates", err));
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) return;

    const selectedTemplate = templates.find(
      (t) => t.id === parseInt(selectedTemplateId)
    );
    if (!selectedTemplate) return;

    setName(selectedTemplate.name);
    setDescription(selectedTemplate.description || "");

    const fullExercises = exercises.filter((ex) =>
      selectedTemplate.exercises.includes(ex.id)
    );
    const prepared = fullExercises.map((ex) => ({
      ...ex,
      sets: ex.recommended_sets || 3,
      reps: ex.recommended_reps || 10,
    }));
    setSelected(prepared);
  }, [selectedTemplateId, templates, exercises]);

  const toggleExercise = (exercise) => {
    const exists = selected.find((s) => s.id === exercise.id);
    if (exists) {
      setSelected(selected.filter((s) => s.id !== exercise.id));
    } else {
      setSelected([
        ...selected,
        {
          ...exercise,
          sets: exercise.recommended_sets || 3,
          reps: exercise.recommended_reps || 10,
        },
      ]);
    }
  };

  const updateSetRep = (id, key, value) => {
    setSelected(
      selected.map((item) =>
        item.id === id ? { ...item, [key]: parseInt(value) } : item
      )
    );
  };

  const handleSubmit = async () => {
    try {
      if (selectedTemplateId) {
        await axiosInstance.post(
          `/workout-plans/assign_from_template/`,
          {
            template_id: parseInt(selectedTemplateId),
            user_id: receiverId,
          },
          { headers: { Authorization: `Token ${authToken}` } }
        );
      } else {
        const res = await axiosInstance.post(
          "/workout-plans/",
          {
            name,
            description,
            user: receiverId,
            exercises: selected.map((s) => s.id),
          },
          { headers: { Authorization: `Token ${authToken}` } }
        );

        const planId = res.data.id;

        await axiosInstance.post(
          `/workout-plans/${planId}/send/`,
          {},
          { headers: { Authorization: `Token ${authToken}` } }
        );
      }

      onClose(true);
    } catch (err) {
      console.error("Failed to submit plan", err);
      alert("Error sending plan");
    }
  };

  const handleSaveTemplate = async () => {
    if (!name || selected.length === 0) {
      alert("Please provide a name and select at least one exercise.");
      return;
    }

    try {
      await axiosInstance.post(
        "/plan-templates/",
        {
          name,
          description,
          exercises: selected.map((s) => s.id),
        },
        { headers: { Authorization: `Token ${authToken}` } }
      );
      alert("Template saved successfully!");
      onClose(true);
      setToastMessage("Template saved ✅");
setTimeout(() => setToastMessage(""), 3000);

    } catch (err) {
      console.error("Failed to save template", err);
      alert("Error saving template");
    }
  };

  return (
    <div className="plan-modal-overlay">
      <div className="plan-modal">
        <h2>Create Workout Plan</h2>

        <div className="template-section">
          <label>🧰 Choose a Template (optional)</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            <option value="">Choose a Template (optional)</option>
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>Plan Name</label>
          <input
            type="text"
            placeholder="Plan name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label>Description</label>
          <textarea
            placeholder="Plan description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* NEW: Exercise Search */}
        <div className="form-section">
          <label>🔍 Search Exercises</label>
          <input
            type="text"
            placeholder="Search by name, target, or equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {selected.length > 0 && (
  <div className="selected-preview">
    <strong>Selected Exercises:</strong>
    <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
      {selected.map((ex, i) => (
        <li key={ex.id}>
          {i + 1}. {ex.name} — {ex.sets} sets × {ex.reps} reps
        </li>
      ))}
    </ul>
  </div>
)}


        {/* Filtered Exercise List */}
        {/* Filtered Exercise List */}
<div className="exercise-list">
  {exercises
    .filter((ex) =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 10) //  Limit to 10 results
    .map((ex) => (
      <div key={ex.id} className="exercise-item">
        <label>
          <input
            type="checkbox"
            checked={!!selected.find((s) => s.id === ex.id)}
            onChange={() => toggleExercise(ex)}
          />
          {ex.name}
        </label>
        {selected.find((s) => s.id === ex.id) && (
          <div className="sets-reps">
            <input
              type="number"
              min="1"
              value={selected.find((s) => s.id === ex.id)?.sets || 3}
              onChange={(e) => updateSetRep(ex.id, "sets", e.target.value)}
              placeholder="Sets"
            />
            <input
              type="number"
              min="1"
              value={selected.find((s) => s.id === ex.id)?.reps || 10}
              onChange={(e) => updateSetRep(ex.id, "reps", e.target.value)}
              placeholder="Reps"
            />
          </div>
        )}
      </div>
    ))}
</div>

{/* Modal Actions */}
<div className="modal-actions">
  <button onClick={onClose}>Cancel</button>
  <button onClick={handleSaveTemplate}>💾 Save as Template</button>
  <button onClick={handleSubmit}>Send Plan</button>
</div>

{/* Toast Notification */}
{toastMessage && (
  <div className="toast">{toastMessage}</div>
)}

      </div>
    </div>
  );
};

export default PlanModal;
