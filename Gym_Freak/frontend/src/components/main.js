document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const exerciseSearch = document.getElementById('exerciseSearch');
    const searchResults = document.getElementById('searchResults');
    const clearSearchBtn = document.getElementById('clearSearch');
    const exerciseDetailsSection = document.getElementById('exerciseDetailsSection');
    const exerciseImage = document.getElementById('exerciseImage');
    const exerciseName = document.getElementById('exerciseName');
    const targetMuscle = document.getElementById('targetMuscle');
    const difficultyLevel = document.getElementById('difficultyLevel');
    const equipmentNeeded = document.getElementById('equipmentNeeded');
    const exerciseDescription = document.getElementById('exerciseDescription');
    const addToWorkoutBtn = document.getElementById('addToWorkout');
    const workoutExercises = document.getElementById('workoutExercises');
    const emptyWorkoutMessage = document.getElementById('emptyWorkoutMessage');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const finishWorkoutBtn = document.getElementById('finishWorkout');
    
    // Session timer
    const sessionTimeElement = document.getElementById('sessionTime');
    let sessionSeconds = 0;
    let sessionTimer;
    
    // Start session timer
    startSessionTimer();
    
    // Current workout data
    let currentWorkout = {
        exercises: [],
        title: "Today's Workout",
        description: "Workout on " + new Date().toLocaleDateString()
    };
    
    // Search functionality
    exerciseSearch.addEventListener('input', debounce(searchExercises, 500));
    
    // Clear search
    clearSearchBtn.addEventListener('click', function() {
        exerciseSearch.value = '';
        searchResults.innerHTML = '';
        clearSearchBtn.classList.add('hidden');
    });
    
    // Add to workout
    addToWorkoutBtn.addEventListener('click', function() {
        const exerciseId = addToWorkoutBtn.dataset.exerciseId;
        const exercise = JSON.parse(addToWorkoutBtn.dataset.exercise);
        
        // Check if exercise already in workout
        if (!currentWorkout.exercises.some(ex => ex.id === exercise.id)) {
            currentWorkout.exercises.push(exercise);
            updateWorkoutUI();
        }
        
        // Hide exercise details and show search results
        exerciseDetailsSection.classList.add('hidden');
    });
    
    // Finish workout
    finishWorkoutBtn.addEventListener('click', submitWorkout);
    
    // Search for exercises
    function searchExercises() {
        const query = exerciseSearch.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            clearSearchBtn.classList.add('hidden');
            return;
        }
        
        clearSearchBtn.classList.remove('hidden');
        
        // Show loading state
        searchResults.innerHTML = '<div class="search-loading">Loading...</div>';
        
        // Fetch exercises from API
        fetch(`/api/exercises/?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data);
            })
            .catch(error => {
                console.error('Error fetching exercises:', error);
                searchResults.innerHTML = '<div class="search-error">Error fetching exercises. Please try again.</div>';
            });
    }
    
    // Display search results
    function displaySearchResults(exercises) {
        if (exercises.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No exercises found. Try a different search term.</div>';
            return;
        }
        
        searchResults.innerHTML = '';
        
        exercises.forEach(exercise => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            resultItem.innerHTML = `
                <h3>${exercise.name}</h3>
                <p>${exercise.target}</p>
                <button class="view-exercise-details" data-id="${exercise.id}">View Details</button>
            `;
            
            resultItem.querySelector('.view-exercise-details').addEventListener('click', function() {
                displayExerciseDetails(exercise);
            });
            
            searchResults.appendChild(resultItem);
        });
    }
    
    // Display exercise details
    function displayExerciseDetails(exercise) {
        exerciseImage.src = exercise.image_url;
        exerciseName.textContent = exercise.name;
        targetMuscle.textContent = exercise.target;
        difficultyLevel.textContent = exercise.difficulty || 'Medium';
        equipmentNeeded.textContent = exercise.equipment;
        exerciseDescription.textContent = exercise.description;
        
        // Set exercise data for adding to workout
        addToWorkoutBtn.dataset.exerciseId = exercise.id;
        addToWorkoutBtn.dataset.exercise = JSON.stringify(exercise);
        
        // Show details section
        exerciseDetailsSection.classList.remove('hidden');
    }
    
    // Update workout UI
    function updateWorkoutUI() {
        if (currentWorkout.exercises.length === 0) {
            emptyWorkoutMessage.classList.remove('hidden');
            progressContainer.classList.add('hidden');
            workoutExercises.innerHTML = '';
            return;
        }
        
        emptyWorkoutMessage.classList.add('hidden');
        progressContainer.classList.remove('hidden');
        workoutExercises.innerHTML = '';
        
        currentWorkout.exercises.forEach((exercise, index) => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'workout-exercise-item';
            
            exerciseItem.innerHTML = `
                <div class="exercise-header">
                    <h4>${exercise.name}</h4>
                    <button class="remove-exercise" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="exercise-sets">
                    <div class="set-header">
                        <span class="set-label">Set</span>
                        <span class="weight-label">Weight</span>
                        <span class="reps-label">Reps</span>
                        <span class="actions-label">Actions</span>
                    </div>
                    <div class="sets-container" id="sets-${exercise.id}">
                        ${generateSetHTML(exercise, 0)}
                    </div>
                    <button class="add-set-btn" data-exercise-id="${exercise.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Set
                    </button>
                </div>
            `;
            
            workoutExercises.appendChild(exerciseItem);
        });
        
        // Add event listeners for set buttons
        attachSetEventListeners();
        
        // Update progress bar
        updateProgressBar();
    }
    
    // Generate set HTML
    function generateSetHTML(exercise, setIndex) {
        if (!exercise.sets) {
            exercise.sets = [{ set: 1, weight: '', reps: '' }];
        }
        
        let setHTML = '';
        exercise.sets.forEach((set, idx) => {
            setHTML += `
                <div class="set-row" data-set-index="${idx}">
                    <span class="set-number">${idx + 1}</span>
                    <input type="number" class="weight-input" placeholder="lbs" value="${set.weight || ''}">
                    <input type="number" class="reps-input" placeholder="reps" value="${set.reps || ''}">
                    <button class="remove-set-btn" data-exercise-id="${exercise.id}" data-set-index="${idx}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;
        });
        
        return setHTML;
    }
    
    // Attach event listeners for sets
    function attachSetEventListeners() {
        // Remove exercise buttons
        document.querySelectorAll('.remove-exercise').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                currentWorkout.exercises.splice(index, 1);
                updateWorkoutUI();
            });
        });
        
        // Add set buttons
        document.querySelectorAll('.add-set-btn').forEach(button => {
            button.addEventListener('click', function() {
                const exerciseId = this.dataset.exerciseId;
                const exercise = currentWorkout.exercises.find(ex => ex.id == exerciseId);
                
                if (!exercise.sets) {
                    exercise.sets = [];
                }
                
                exercise.sets.push({ set: exercise.sets.length + 1, weight: '', reps: '' });
                
                const setsContainer = document.getElementById(`sets-${exerciseId}`);
                setsContainer.innerHTML = generateSetHTML(exercise);
                
                attachSetEventListeners();
            });
        });
        
        // Remove set buttons
        document.querySelectorAll('.remove-set-btn').forEach(button => {
            button.addEventListener('click', function() {
                const exerciseId = this.dataset.exerciseId;
                const setIndex = parseInt(this.dataset.setIndex);
                const exercise = currentWorkout.exercises.find(ex => ex.id == exerciseId);
                
                exercise.sets.splice(setIndex, 1);
                
                const setsContainer = document.getElementById(`sets-${exerciseId}`);
                setsContainer.innerHTML = generateSetHTML(exercise);
                
                attachSetEventListeners();
            });
        });
        
        // Weight and reps inputs
        document.querySelectorAll('.weight-input, .reps-input').forEach(input => {
            input.addEventListener('change', function() {
                const setRow = this.closest('.set-row');
                const exerciseItem = this.closest('.workout-exercise-item');
                const exerciseIndex = Array.from(workoutExercises.children).indexOf(exerciseItem);
                const setIndex = parseInt(setRow.dataset.setIndex);
                
                if (!currentWorkout.exercises[exerciseIndex].sets) {
                    currentWorkout.exercises[exerciseIndex].sets = [{ set: 1, weight: '', reps: '' }];
                }
                
                if (this.classList.contains('weight-input')) {
                    currentWorkout.exercises[exerciseIndex].sets[setIndex].weight = this.value;
                } else {
                    currentWorkout.exercises[exerciseIndex].sets[setIndex].reps = this.value;
                }
                
                updateProgressBar();
            });
        });
    }
    
    // Update progress bar
    function updateProgressBar() {
        let completedSets = 0;
        let totalSets = 0;
        
        currentWorkout.exercises.forEach(exercise => {
            if (exercise.sets) {
                totalSets += exercise.sets.length;
                
                exercise.sets.forEach(set => {
                    if (set.weight && set.reps) {
                        completedSets++;
                    }
                });
            }
        });
        
        const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
        progressBar.style.width = `${progress}%`;
    }
    
    // Submit workout
    function submitWorkout() {
        if (currentWorkout.exercises.length === 0) {
            alert('Please add exercises to your workout before submitting.');
            return;
        }
        
        // Calculate workout duration
        const duration = sessionSeconds;
        
        // Prepare workout data
        const workoutData = {
            title: currentWorkout.title,
            description: currentWorkout.description,
            exercises: currentWorkout.exercises.map(ex => ex.id),
            sets: currentWorkout.exercises.map(ex => ({
                exercise_id: ex.id,
                sets: ex.sets || []
            })),
            duration: duration
        };
        
        // Send to API
        fetch('/api/workouts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(workoutData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('Workout saved successfully!');
            resetWorkout();
        })
        .catch(error => {
            console.error('Error saving workout:', error);
            alert('Error saving workout. Please try again.');
        });
    }
    
    // Reset workout
    function resetWorkout() {
        currentWorkout = {
            exercises: [],
            title: "Today's Workout",
            description: "Workout on " + new Date().toLocaleDateString()
        };
        
        updateWorkoutUI();
        resetSessionTimer();
    }
    
    // Start session timer
    function startSessionTimer() {
        sessionTimer = setInterval(function() {
            sessionSeconds++;
            const hours = Math.floor(sessionSeconds / 3600);
            const minutes = Math.floor((sessionSeconds % 3600) / 60);
            const seconds = sessionSeconds % 60;
            
            sessionTimeElement.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }, 1000);
    }
    
    // Reset session timer
    function resetSessionTimer() {
        clearInterval(sessionTimer);
        sessionSeconds = 0;
        sessionTimeElement.textContent = '00:00:00';
        startSessionTimer();
    }
    
    // Utility functions
    function pad(num) {
        return num.toString().padStart(2, '0');
    }
    
    function debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});