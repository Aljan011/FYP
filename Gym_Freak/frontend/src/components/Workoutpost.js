import React, { useState, useEffect } from "react";

const Workoutpost = (props) => {
  const [filter, setFilter] = useState({ difficulty: '', target: '' });
  const [filteredExercises, setFilteredExercises] = useState(exercisesDatabase);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutData, setWorkoutData] = useState({ title: '', description: '' });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  // Apply filters whenever `filter` changes
  useEffect(() => {
    let results = exercisesDatabase;
    if (filter.difficulty) {
      results = results.filter(exercise => exercise.difficulty === filter.difficulty);
    }
    if (filter.target) {
      results = results.filter(exercise => exercise.target === filter.target);
    }
    setFilteredExercises(results);
  }, [filter]); // Dependency array ensures this runs when `filter` changes

  const handleExerciseSelect = (exercise) => {
    setSelectedExercises((prevSelectedExercises) => {
      const isAlreadySelected = prevSelectedExercises.some((ex) => ex.id === exercise.id);
      if (isAlreadySelected) {
        return prevSelectedExercises.filter((ex) => ex.id !== exercise.id); // Remove if already selected
      } else {
        return [...prevSelectedExercises, exercise]; // Add to the selected list
      }
    });
  };

  const handleSubmit = async () => {
    const workoutDataToSubmit = {
      title: workoutData.title,
      description: workoutData.description,
      exercises: selectedExercises.map((exercise) => exercise.id) // Send exercise ids
    };

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error:', error);
      alert("Error submitting workout!");
    }
  };

  return (
    <div>
      <h1>Workout Posting Page</h1>
      <div>
        <label>
          Difficulty:
          <select name="difficulty" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </label>
        <label>
          Target Muscle:
          <select name="target" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Chest">Chest</option>
            <option value="Legs">Legs</option>
            <option value="Back">Back</option>
            <option value="Shoulders">Shoulders</option>
            <option value="Arms">Arms</option>
          </select>
        </label>
      </div>

      <div id="exerciseList">
        {filteredExercises.map(exercise => (
          <div key={exercise.id}>
            <h2>{exercise.name}</h2>
            <img src={exercise.image} alt={exercise.name} />
            <p>{exercise.description}</p>
            <button onClick={() => handleExerciseSelect(exercise)}>
              {selectedExercises.some((ex) => ex.id === exercise.id) ? 'Remove' : 'Add'}
            </button>
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          placeholder="Workout Title"
          value={workoutData.title}
          onChange={(e) => setWorkoutData({ ...workoutData, title: e.target.value })}
        />
        <textarea
          placeholder="Workout Description"
          value={workoutData.description}
          onChange={(e) => setWorkoutData({ ...workoutData, description: e.target.value })}
        />
      </div>

      <button onClick={handleSubmit}>Submit Workout</button>
    </div>
  );
};

export default Workoutpost;
