import React, { useState, useEffect } from "react";

const Workoutpost = (props) => {
  const [filter, setFilter] = useState({ difficulty: "", target: "" });
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutData, setWorkoutData] = useState({ title: "", description: "" });
  const [query, setQuery] = useState("");

  // Fetch exercises from backend dynamically based on query and filters
  useEffect(() => {
    let url = "/api/get_exercises/";
    const params = new URLSearchParams();

    if (query) params.append("q", query);
    if (filter.difficulty) params.append("difficulty", filter.difficulty);
    if (filter.target) params.append("target", filter.target);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => setFilteredExercises(data))
      .catch((error) => console.error("Error fetching exercises:", error));
  }, [query, filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercises((prevSelectedExercises) => {
      const isAlreadySelected = prevSelectedExercises.some((ex) => ex.id === exercise.id);
      return isAlreadySelected
        ? prevSelectedExercises.filter((ex) => ex.id !== exercise.id)
        : [...prevSelectedExercises, exercise];
    });
  };

  const handleSubmit = async () => {
    const workoutDataToSubmit = {
      title: workoutData.title,
      description: workoutData.description,
      exercises: selectedExercises.map((exercise) => exercise.id),
    };

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workoutDataToSubmit),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Workout Submitted Successfully!");
        console.log(data);
      } else {
        const error = await response.json();
        alert("Error submitting workout: " + error.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting workout!");
    }
  };

  return (
    <div>
      <h1>Search and Filter Exercises</h1>
      <input
        type="text"
        placeholder="Search exercises..."
        value={query}
        onChange={handleSearchChange}
      />

      <select name="difficulty" value={filter.difficulty} onChange={handleFilterChange}>
        <option value="">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <select name="target" value={filter.target} onChange={handleFilterChange}>
        <option value="">All Targets</option>
        <option value="chest">Chest</option>
        <option value="legs">Legs</option>
        <option value="arms">Arms</option>
      </select>

      <div id="exerciseList">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <div key={exercise.id}>
              <h2>{exercise.name}</h2>
              <img src={exercise.image_url} alt={exercise.name} />
              <p>{exercise.description}</p>
              <p><strong>Target:</strong> {exercise.target}</p>
              <p><strong>Equipment:</strong> {exercise.equipment}</p>
              <button onClick={() => handleExerciseSelect(exercise)}>
                {selectedExercises.some((ex) => ex.id === exercise.id) ? "Deselect" : "Select"}
              </button>
            </div>
          ))
        ) : (
          <p>No exercises found.</p>
        )}
      </div>

      <button onClick={handleSubmit}>Submit Workout</button>
    </div>
  );
};

export default Workoutpost;
