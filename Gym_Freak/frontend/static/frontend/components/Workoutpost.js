import React,{Component} from "react";

export default class Workoutpost extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <p>This is the workout posting page</p>
    }
}


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
  
  // Initialize App
  document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const exerciseSearch = document.getElementById('exerciseSearch');
    const clearSearch = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    const exerciseDetailsSection = document.getElementById('exerciseDetailsSection');
    const addToWorkout = document.getElementById('addToWorkout');
    const workoutExercises = document.getElementById('workoutExercises');
    const emptyWorkoutMessage = document.getElementById('emptyWorkoutMessage');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const finishWorkout = document.getElementById('finishWorkout');
    const workoutSummaryModal = document.getElementById('workoutSummaryModal');
    const restTimerModal = document.getElementById('restTimerModal');
    const overlay = document.getElementById('overlay');
    const sessionTimeElement = document.getElementById('sessionTime');
    
    // State Management
    let currentExercise = null;
    let currentWorkout = [];
    let sessionStartTime = null;
    let sessionTimer = null;
    let isRestTimerActive = false;
    let timerInterval = null;
    let timerValue = 60; // Default rest timer value in seconds
    let timerDisplay = document.getElementById('timerValue');
    let restTimerAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-simple-countdown-922.mp3');
    
    // LocalStorage keys
    const WORKOUT_STORAGE_KEY = 'gymfreak_current_workout';
    const THEME_STORAGE_KEY = 'gymfreak_theme';
    
    // Check if there's a saved workout session
    const loadSavedWorkout = () => {
      const savedWorkout = localStorage.getItem(WORKOUT_STORAGE_KEY);
      if (savedWorkout) {
        try {
          currentWorkout = JSON.parse(savedWorkout);
          renderWorkout();
          startWorkoutSession();
        } catch (error) {
          console.error('Error loading saved workout:', error);
        }
      }
    };
    
    // Initialize theme from localStorage
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
      }
    };
    
    // Theme Toggle
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem(
        THEME_STORAGE_KEY, 
        document.body.classList.contains('dark-mode') ? 'dark' : 'light'
      );
    });
    
    // Exercise Search Functionality
    exerciseSearch.addEventListener('input', (e) => {
      const searchValue = e.target.value.toLowerCase().trim();
      
      if (searchValue.length < 2) {
        searchResults.classList.remove('active');
        return;
      }
      
      const filteredExercises = exercisesDatabase.filter(exercise => 
        exercise.name.toLowerCase().includes(searchValue) || 
        exercise.target.toLowerCase().includes(searchValue)
      );
      
      renderSearchResults(filteredExercises);
    });
    
    // Clear Search
    clearSearch.addEventListener('click', () => {
      exerciseSearch.value = '';
      searchResults.classList.remove('active');
    });
    
    // Render Search Results
    const renderSearchResults = (exercises) => {
      searchResults.innerHTML = '';
      
      if (exercises.length === 0) {
        searchResults.innerHTML = `
          <div class="search-result-item">
            <div>No exercises found</div>
          </div>
        `;
        searchResults.classList.add('active');
        return;
      }
      
      exercises.forEach(exercise => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
          <div>
            <div class="exercise-result-name">${exercise.name}</div>
            <div class="exercise-result-target">${exercise.target}</div>
          </div>
        `;
        
        resultItem.addEventListener('click', () => {
          displayExerciseDetails(exercise);
          searchResults.classList.remove('active');
          exerciseSearch.value = '';
        });
        
        searchResults.appendChild(resultItem);
      });
      
      searchResults.classList.add('active');
    };
    
    // Display Exercise Details
    const displayExerciseDetails = (exercise) => {
      currentExercise = exercise;
      
      document.getElementById('exerciseImage').src = exercise.image;
      document.getElementById('exerciseName').textContent = exercise.name;
      document.getElementById('targetMuscle').textContent = exercise.target;
      document.getElementById('difficultyLevel').textContent = exercise.difficulty;
      document.getElementById('equipmentNeeded').textContent = exercise.equipment;
      document.getElementById('exerciseDescription').textContent = exercise.description;
      
      exerciseDetailsSection.classList.remove('hidden');
      exerciseDetailsSection.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Add Exercise to Workout
    addToWorkout.addEventListener('click', () => {
      if (!currentExercise) return;
      
      // Check if already in workout
      const existingExerciseIndex = currentWorkout.findIndex(ex => ex.id === currentExercise.id);
      
      if (existingExerciseIndex >= 0) {
        // Show toast or alert
        alert('This exercise is already in your workout!');
        return;
      }
      
      // Add to workout with initial set
      const workoutExercise = {
        ...currentExercise,
        sets: [{
          id: generateId(),
          weight: '',
          reps: '',
          completed: false
        }],
        notes: '',
        expanded: true
      };
      
      currentWorkout.push(workoutExercise);
      saveWorkout();
      renderWorkout();
      
      // Start tracking session time if this is the first exercise
      if (currentWorkout.length === 1) {
        startWorkoutSession();
      }
      
      // Hide exercise details
      exerciseDetailsSection.classList.add('hidden');
    });
    
    // Start Workout Session
    const startWorkoutSession = () => {
      if (!sessionStartTime) {
        sessionStartTime = new Date();
        updateSessionTime();
        sessionTimer = setInterval(updateSessionTime, 1000);
      }
    };
    
    // Update Session Time
    const updateSessionTime = () => {
      if (!sessionStartTime) return;
      
      const currentTime = new Date();
      const elapsedTime = Math.floor((currentTime - sessionStartTime) / 1000);
      
      const hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
      const seconds = (elapsedTime % 60).toString().padStart(2, '0');
      
      sessionTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    };
    
    // Render Workout
    const renderWorkout = () => {
      if (currentWorkout.length === 0) {
        emptyWorkoutMessage.classList.remove('hidden');
        progressContainer.classList.add('hidden');
        workoutExercises.innerHTML = '';
        return;
      }
      
      emptyWorkoutMessage.classList.add('hidden');
      progressContainer.classList.remove('hidden');
      workoutExercises.innerHTML = '';
      
      // Calculate and update progress
      updateWorkoutProgress();
      
      currentWorkout.forEach((exercise, index) => {
        const exerciseElement = document.createElement('div');
        exerciseElement.className = `workout-exercise-item ${exercise.expanded ? '' : 'collapsed'}`;
        exerciseElement.dataset.index = index;
        
        // Exercise Header
        const headerHTML = `
          <div class="exercise-header">
            <div class="exercise-header-info">
              <div class="exercise-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
              </div>
              <div>
                <div class="exercise-header-name">${exercise.name}</div>
                <div class="exercise-header-details">${exercise.target} - ${exercise.difficulty}</div>
              </div>
            </div>
            <div class="exercise-actions">
              <button class="exercise-action-btn expand-toggle">
                <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <button class="exercise-action-btn delete-exercise">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `;
        
        // Exercise Content (Sets)
        const setsHTML = `
          <div class="exercise-content">
            <div class="sets-header">
              <div class="set-number">Set</div>
              <div class="weight-label">Weight (kg)</div>
              <div class="reps-label">Reps</div>
              <div style="width: 80px;"></div>
            </div>
            <div class="sets-container" data-exercise-index="${index}">
              ${exercise.sets.map((set, setIndex) => `
                <div class="set-row" data-set-id="${set.id}">
                  <div class="set-label">${setIndex + 1}</div>
                  <div class="input-group">
                    <input type="number" class="exercise-input weight-input" value="${set.weight}" placeholder="0">
                    <span class="input-unit">kg</span>
                  </div>
                  <div class="input-group">
                    <input type="number" class="exercise-input reps-input" value="${set.reps}" placeholder="0">
                    <span class="input-unit">reps</span>
                  </div>
                  <div class="set-actions">
                    <button class="set-action-btn delete-set-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
            <button class="add-set-btn" data-exercise-index="${index}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Set
            </button>
          </div>
        `;
        
        // Exercise Footer
        const footerHTML = `
          <div class="exercise-footer">
            <button class="notes-toggle" data-exercise-index="${index}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Notes
            </button>
            <button class="set-timer-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Rest Timer
            </button>
          </div>
        `;
        
        // Notes Section
        const notesHTML = `
          <div class="notes-section ${exercise.notes ? 'show' : ''}">
            <textarea class="notes-input" data-exercise-index="${index}" placeholder="Add notes about this exercise...">${exercise.notes}</textarea>
          </div>
        `;
        
        exerciseElement.innerHTML = headerHTML + setsHTML + footerHTML + notesHTML;
        workoutExercises.appendChild(exerciseElement);
      });
      
      // Add event listeners for exercise controls
      addExerciseEventListeners();
    };
    
    // Add Event Listeners for Exercise Controls
    const addExerciseEventListeners = () => {
      // Toggle exercise expansion
      document.querySelectorAll('.expand-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
          const exerciseItem = e.target.closest('.workout-exercise-item');
          exerciseItem.classList.toggle('collapsed');
          
          const index = parseInt(exerciseItem.dataset.index);
          currentWorkout[index].expanded = !exerciseItem.classList.contains('collapsed');
          saveWorkout();
        });
      });
      
      // Delete exercise
      document.querySelectorAll('.delete-exercise').forEach(button => {
        button.addEventListener('click', (e) => {
          const exerciseItem = e.target.closest('.workout-exercise-item');
          const index = parseInt(exerciseItem.dataset.index);
          
          if (confirm('Are you sure you want to remove this exercise from your workout?')) {
            currentWorkout.splice(index, 1);
            saveWorkout();
            renderWorkout();
            
            // If workout is now empty, stop session timer
            if (currentWorkout.length === 0) {
              clearInterval(sessionTimer);
              sessionTimer = null;
              sessionStartTime = null;
            }
          }
        });
      });
      
      // Delete set
      document.querySelectorAll('.delete-set-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const setRow = e.target.closest('.set-row');
          const setId = setRow.dataset.setId;
          const exerciseIndex = parseInt(setRow.closest('.sets-container').dataset.exerciseIndex);
          
          // Don't allow deletion if there's only one set
          if (currentWorkout[exerciseIndex].sets.length <= 1) {
            alert('You cannot delete the only set. An exercise must have at least one set.');
            return;
          }
          
          currentWorkout[exerciseIndex].sets = currentWorkout[exerciseIndex].sets.filter(set => set.id !== setId);
          saveWorkout();
          renderWorkout();
        });
      });
      
      // Add set
      document.querySelectorAll('.add-set-btn').forEach(button => {
        button.addEventListener('click', () => {
          const exerciseIndex = parseInt(button.dataset.exerciseIndex);
          
          currentWorkout[exerciseIndex].sets.push({
            id: generateId(),
            weight: '',
            reps: '',
            completed: false
          });
          
          saveWorkout();
          renderWorkout();
        });
      });
      
      // Weight and Reps input
      document.querySelectorAll('.weight-input, .reps-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const setRow = e.target.closest('.set-row');
          const setId = setRow.dataset.setId;
          const exerciseIndex = parseInt(setRow.closest('.sets-container').dataset.exerciseIndex);
          const setIndex = currentWorkout[exerciseIndex].sets.findIndex(set => set.id === setId);
          
          if (e.target.classList.contains('weight-input')) {
            currentWorkout[exerciseIndex].sets[setIndex].weight = e.target.value;
          } else {
            currentWorkout[exerciseIndex].sets[setIndex].reps = e.target.value;
          }
          
          currentWorkout[exerciseIndex].sets[setIndex].completed = 
            currentWorkout[exerciseIndex].sets[setIndex].weight !== '' && 
            currentWorkout[exerciseIndex].sets[setIndex].reps !== '';
          
          saveWorkout();
          updateWorkoutProgress();
        });
      });
      
      // Notes input
      document.querySelectorAll('.notes-input').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
          const exerciseIndex = parseInt(e.target.dataset.exerciseIndex);
          currentWorkout[exerciseIndex].notes = e.target.value;
          saveWorkout();
        });
      });
      
      // Toggle notes section
      document.querySelectorAll('.notes-toggle').forEach(button => {
        button.addEventListener('click', (e) => {
          const exerciseIndex = parseInt(e.target.dataset.exerciseIndex);
          const exerciseItem = e.target.closest('.workout-exercise-item');
          const notesSection = exerciseItem.querySelector('.notes-section');
          
          notesSection.classList.toggle('show');
        });
      });
      
      // Rest timer
      document.querySelectorAll('.set-timer-btn').forEach(button => {
        button.addEventListener('click', () => {
          openRestTimerModal();
        });
      });
    };
    
    // Update Workout Progress
    const updateWorkoutProgress = () => {
      if (currentWorkout.length === 0) return;
      
      let completedSets = 0;
      let totalSets = 0;
      
      currentWorkout.forEach(exercise => {
        exercise.sets.forEach(set => {
          totalSets++;
          if (set.completed) completedSets++;
        });
      });
      
      const progressPercentage = Math.round((completedSets / totalSets) * 100);
      progressBar.style.width = `${progressPercentage}%`;
    };
    
    // Finish Workout
    finishWorkout.addEventListener('click', () => {
      if (currentWorkout.length === 0) return;
      
      // Calculate workout statistics
      const stats = calculateWorkoutStats();
      
      // Update summary modal with stats
      document.getElementById('totalExercises').textContent = stats.totalExercises;
      document.getElementById('totalSets').textContent = stats.totalSets;
      document.getElementById('totalReps').textContent = stats.totalReps;
      document.getElementById('totalWeight').textContent = stats.totalWeight;
      document.getElementById('totalDuration').textContent = sessionTimeElement.textContent;
      
      // Open summary modal
      openWorkoutSummaryModal();
    });
    
    // Calculate Workout Statistics
    const calculateWorkoutStats = () => {
      let totalExercises = currentWorkout.length;
      let totalSets = 0;
      let totalReps = 0;
      let totalWeight = 0;
      
      currentWorkout.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.completed) {
            totalSets++;
            totalReps += parseInt(set.reps) || 0;
            totalWeight += (parseInt(set.weight) || 0) * (parseInt(set.reps) || 0);
          }
        });
      });
      
      return {
        totalExercises,
        totalSets,
        totalReps,
        totalWeight
      };
    };
    
    // Open Workout Summary Modal
    const openWorkoutSummaryModal = () => {
      workoutSummaryModal.classList.add('active');
      overlay.classList.add('active');
    };
    
    // Open Rest Timer Modal
    const openRestTimerModal = () => {
      restTimerModal.classList.add('active');
      overlay.classList.add('active');
      
      // Reset timer to default
      timerValue = 60;
      updateTimerDisplay();
      
      // Reset controls
      document.getElementById('startTimer').disabled = false;
      document.getElementById('pauseTimer').disabled = true;
      document.getElementById('resetTimer').disabled = true;
      
      // Highlight active preset
      document.querySelectorAll('.timer-preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.time) === timerValue);
      });
    };
    
    // Close Modals
    document.querySelectorAll('.close-modal').forEach(button => {
      button.addEventListener('click', () => {
        workoutSummaryModal.classList.remove('active');
        restTimerModal.classList.remove('active');
        overlay.classList.remove('active');
        
        // Stop the timer if it's running
        if (isRestTimerActive) {
          clearInterval(timerInterval);
          isRestTimerActive = false;
        }
      });
    });
    
    // Save/Complete Workout
    document.getElementById('saveWorkoutWithPhoto').addEventListener('click', () => {
      // In a real app, this would upload the photo and save the workout
      completeWorkout();
    });
    
    document.getElementById('saveWorkoutWithoutPhoto').addEventListener('click', () => {
      completeWorkout();
    });
    
    // Complete Workout (Clear current workout and reset session)
    const completeWorkout = () => {
      // In a real app, this would send the workout data to a server
      
      // Clear current workout
      currentWorkout = [];
      localStorage.removeItem(WORKOUT_STORAGE_KEY);
      
      // Stop session timer
      clearInterval(sessionTimer);
      sessionTimer = null;
      sessionStartTime = null;
      sessionTimeElement.textContent = '00:00:00';
      
      // Close modal
      workoutSummaryModal.classList.remove('active');
      overlay.classList.remove('active');
      
      // Update UI
      renderWorkout();
      
      // Show success message
      alert('Workout completed and saved successfully!');
    };
    
    // Handle photo upload
    document.getElementById('photoUpload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = `<img src="${e.target.result}" alt="Workout photo">`;
      };
      reader.readAsDataURL(file);
    });
    
    // Timer Controls
    document.querySelectorAll('.timer-preset-btn').forEach(button => {
      button.addEventListener('click', () => {
        timerValue = parseInt(button.dataset.time);
        updateTimerDisplay();
        
        // Update active state
        document.querySelectorAll('.timer-preset-btn').forEach(btn => {
          btn.classList.toggle('active', btn === button);
        });
      });
    });
    
    document.getElementById('startTimer').addEventListener('click', () => {
      if (isRestTimerActive) return;
      
      isRestTimerActive = true;
      
      timerInterval = setInterval(() => {
        timerValue--;
        updateTimerDisplay();
        
        if (timerValue <= 0) {
          clearInterval(timerInterval);
          isRestTimerActive = false;
          // Play sound
          restTimerAudio.play();
          // Update button states
          document.getElementById('startTimer').disabled = true;
          document.getElementById('pauseTimer').disabled = true;
          document.getElementById('resetTimer').disabled = false;
        }
      }, 1000);
      
      // Update button states
      document.getElementById('startTimer').disabled = true;
      document.getElementById('pauseTimer').disabled = false;
      document.getElementById('resetTimer').disabled = false;
    });
    
    document.getElementById('pauseTimer').addEventListener('click', () => {
      clearInterval(timerInterval);
      isRestTimerActive = false;
      
      // Update button states
      document.getElementById('startTimer').disabled = false;
      document.getElementById('pauseTimer').disabled = true;
      document.getElementById('resetTimer').disabled = false;
    });
    
    document.getElementById('resetTimer').addEventListener('click', () => {
      clearInterval(timerInterval);
      isRestTimerActive = false;
      timerValue = 60;
      updateTimerDisplay();
      
      // Update button states
      document.getElementById('startTimer').disabled = false;
      document.getElementById('pauseTimer').disabled = true;
      document.getElementById('resetTimer').disabled = true;
      
      // Reset active preset
      document.querySelectorAll('.timer-preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.time) === timerValue);
      });
    });
    
    // Update Timer Display
    const updateTimerDisplay = () => {
      const minutes = Math.floor(timerValue / 60).toString().padStart(2, '0');
      const seconds = (timerValue % 60).toString().padStart(2, '0');
      timerDisplay.textContent = `${minutes}:${seconds}`;
    };
    
    // Save workout to localStorage
    const saveWorkout = () => {
      localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(currentWorkout));
    };
    
    // Generate unique ID for sets
    const generateId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        searchResults.classList.remove('active');
      }
    });
    
    // Initialize app
    initializeTheme();
    loadSavedWorkout();
  });