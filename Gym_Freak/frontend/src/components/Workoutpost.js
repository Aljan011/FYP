import React, { useState } from "react";

const Workoutpost = (props) => {
  const [filter, setFilter] = useState({ difficulty: '', target: '' });
  const [filteredExercises, setFilteredExercises] = useState(exercisesDatabase);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    applyFilters({ ...filter, [name]: value });
  };

  const applyFilters = (filters) => {
    let results = exercisesDatabase;
    if (filters.difficulty) {
      results = results.filter(exercise => exercise.difficulty === filters.difficulty);
    }
    if (filters.target) {
      results = results.filter(exercise => exercise.target === filters.target);
    }
    setFilteredExercises(results);
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workoutpost;

// Exercise Database - Sample exercises data
const exercisesDatabase = [
    {
      id: 1,
      name: "Bench Press",
      target: "Chest",
      difficulty: "Intermediate",
      equipment: "Barbell",
      description: "A compound exercise that primarily targets the pectoralis major, with secondary activation of the anterior deltoids and triceps.",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
    },
    {
      id: 2,
      name: "Squat",
      target: "Legs",
      difficulty: "Intermediate",
      equipment: "Barbell",
      description: "A compound exercise that targets the quadriceps, hamstrings, and glutes, while also engaging the core and lower back muscles.",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
    },
    {
      id: 3,
      name: "Deadlift",
      target: "Back",
      difficulty: "Advanced",
      equipment: "Barbell",
      description: "A compound movement that targets the entire posterior chain, including the back, glutes, and hamstrings, while also engaging the core and grip strength.",
      image: "https://images.unsplash.com/photo-1598575468023-04b58d2d478d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
    },
    {
      id: 4,
      name: "Pull-up",
      target: "Back",
      difficulty: "Intermediate",
      equipment: "Body Weight",
      description: "A compound upper-body exercise that primarily targets the latissimus dorsi and biceps, while also engaging the rear deltoids and core.",
      image: "https://images.unsplash.com/photo-1598971639058-fab30985ada4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80"
    },
    {
      id: 5,
      name: "Military Press",
      target: "Shoulders",
      difficulty: "Intermediate",
      equipment: "Barbell",
      description: "An overhead pressing movement that primarily targets the deltoids and triceps, while also engaging the upper chest and core for stability.",
      image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80"
    },
    {
      id: 6,
      name: "Bicep Curl",
      target: "Arms",
      difficulty: "Beginner",
      equipment: "Dumbbell",
      description: "An isolation exercise that targets the biceps brachii, helping to develop arm strength and definition.",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
    },
    {
      id: 7,
      name: "Tricep Extension",
      target: "Arms",
      difficulty: "Beginner",
      equipment: "Cable",
      description: "An isolation exercise that targets the triceps brachii, helping to develop arm strength and definition.",
      image: "https://images.unsplash.com/photo-1530822847156-e0c08a7b684e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
    },
    {
      id: 8,
      name: "Leg Press",
      target: "Legs",
      difficulty: "Beginner",
      equipment: "Machine",
      description: "A compound lower-body exercise that primarily targets the quadriceps, with secondary activation of the glutes and hamstrings.",
      image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1774&q=80"
    },
    {
      id: 9,
      name: "Lat Pulldown",
      target: "Back",
      difficulty: "Beginner",
      equipment: "Cable",
      description: "A compound exercise that targets the latissimus dorsi, rhomboids, and biceps, helping to develop upper-body pulling strength.",
      image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
    },
    {
      id: 10,
      name: "Chest Fly",
      target: "Chest",
      difficulty: "Beginner",
      equipment: "Dumbbell",
      description: "An isolation exercise that targets the pectoralis major, helping to develop chest definition and strength.",
      image: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
    }
  ];
