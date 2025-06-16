import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/DietPlan.css'; 


const DietPlan = () => {
  // Existing states
  const [dietPlan, setDietPlan] = useState([]);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'saved'
  const [savedDiets, setSavedDiets] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [typeRecipes, setTypeRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [savedTypeIds, setSavedTypeIds] = useState([]);


  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);

  // Existing animation functions
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.dp-plan-card, .dp-benefit-card, .dp-testimonial-card, .dp-section-header');

    elements.forEach(element => {
      if (!element.classList.contains('dp-fade-up')) {
        element.classList.add('dp-fade-up');
      }

      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (elementPosition < windowHeight - 100) {
        element.classList.add('dp-active');
      }
    });
  };

  const highlightNavLink = () => {
    const scrollPosition = window.scrollY;
    const sections = document.querySelectorAll('section[id]');

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelector(`.dp-nav-menu a[href="#${sectionId}"]`)?.classList.add('active');
      } else {
        document.querySelector(`.dp-nav-menu a[href="#${sectionId}"]`)?.classList.remove('active');
      }
    });
  };
 //asdkjhdkfdfkjdsfhkljh
  // Fetch all diets (browse tab) fdsfdf
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token found!");
      return;
    }

    console.log("Token being used:", token);

    axios.get("http://localhost:8000/api/diets/", {
      headers: {
        Authorization: `Token ${token}`,
      }
    })
    .then((response) => {
      setDietPlan(response.data);
    })
    .catch((error) => {
      console.error("Failed to fetch diets:", error);
    });
  }, []);

  // Fetch saved diets (saved tab)
  const fetchSavedDiets = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const response = await axios.get("http://localhost:8000/api/saved-diets/", {
      headers: {
        Authorization: `Token ${token}`,
      }
    });

    setSavedDiets(response.data);
    setSavedTypeIds(response.data.map(item => item.diet_type));  // Capture saved IDs
  } catch (error) {
    console.error("Failed to fetch saved diets:", error);
  }
};

  // Handle diet card click to show details
  const handleDietClick = async (diet) => {
    setSelectedDiet(diet);
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Token ${token}` } : {};

      const recipeResponse = await axios.get(
        `http://localhost:8000/api/recipes/by_diet/?diet_id=${diet.id}`,
        { headers }
      );
      setRecipes(recipeResponse.data);
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      setError("Failed to load recipes. Please try again later.");
    }
  };

  // Handle type click to show type recipes
  const handleTypeClick = async (type) => {
    setSelectedType(type);
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const res = await axios.get(
        `http://localhost:8000/api/recipes/by_diet/?diet_id=${type.id}`,
        { headers }
      );
      setTypeRecipes(res.data);
    } catch (err) {
      console.error("Failed to fetch recipes for type:", err);
      setTypeRecipes([]);
    }
  };

  // Handle recipe click to show full recipe details
  const handleRecipeClick = async (recipe) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Token ${token}` } : {};
      const response = await axios.get(`http://localhost:8000/api/recipes/${recipe.id}/`, { headers });
      setSelectedRecipe(response.data);
    } catch (err) {
      console.error("Failed to load full recipe:", err);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'saved') {
      fetchSavedDiets();
    }
    // Reset selected states when changing tabs
    setSelectedDiet(null);
    setSelectedType(null);
    setSelectedRecipe(null);
    setError(null);
  };

  const toggleSaveDietType = async (typeId) => {
  const token = localStorage.getItem("authToken");
  const headers = { Authorization: `Token ${token}` };

  if (savedTypeIds.includes(typeId)) {
    // Unsave
    await axios.delete("http://localhost:8000/api/saved-diets/", {
      headers,
      data: { diet_type_id: typeId }
    });
    setSavedTypeIds(prev => prev.filter(id => id !== typeId));
  } else {
    // Save
    await axios.post("http://localhost:8000/api/saved-diets/", { diet_type_id: typeId }, { headers });
    setSavedTypeIds(prev => [...prev, typeId]);
  }
};



  useEffect(() => {
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('scroll', highlightNavLink);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      });
    });

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('scroll', animateOnScroll);
      window.removeEventListener('scroll', highlightNavLink);
    };
  }, []);

  return (
    <>
      <header className="dp-header">
        <nav className="dp-navbar">
          <div className="dp-logo">
            <h1>GymFreak</h1>
          </div>
          <div className="dp-nav-links" id="navLinks">
            <ul>
              <li><Link to="/UserDash" className="dp-nav-link">Home</Link></li>
              <li><Link to="/workouts" className="dp-nav-link">Track</Link></li>
              <li><Link to="/diet-plan" className="dp-nav-link">Diets</Link></li>
              <li><Link to="/chat" className="dp-nav-link">Chat</Link></li>
            </ul>
          </div>
          <div className="dp-nav-buttons">
            <button className="dp-theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>
          <div className="dp-hamburger" id="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>

      <main className="dp-main">
        {/* Hero Section */}
        <section className="dp-hero">
          <div className="dp-hero-overlay"></div>
          <div className="dp-container">
            <div className="dp-hero-content">
              <span className="dp-badge">Personalized Diet Plans</span>
              <h1>Transform Your Health With Expert Nutrition</h1>
              <p>Our scientifically-backed diet plans are designed by expert nutritionists to help you reach your health goals with delicious, satisfying meals.</p>
              <div className="dp-hero-buttons">
                <a href="#dp-plans" className="dp-button dp-primary">Browse Plans</a>
                <a href="#" className="dp-button dp-secondary">Free Consultation</a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Diet Plans Section with Tabs */}
        <section id="dp-plans" className="dp-plans">
          <div className="dp-container">
            <div className="dp-section-header">
              <span className="dp-badge">Diet Plans</span>
              <h2>Discover Our Personalized Diet Plans</h2>
              <p>Each plan is crafted by expert nutritionists to meet specific health goals while ensuring delicious, satisfying meals.</p>
            </div>

            {/* Tab Navigation */}
            <div className="dp-tab-navigation">
              <button 
                className={`dp-tab-button ${activeTab === 'browse' ? 'dp-tab-active' : ''}`}
                onClick={() => handleTabChange('browse')}
              >
                Browse Diets
              </button>
              <button 
                className={`dp-tab-button ${activeTab === 'saved' ? 'dp-tab-active' : ''}`}
                onClick={() => handleTabChange('saved')}
              >
                Saved Diets
              </button>
            </div>

            {/* Tab Content */}
            <div className="dp-tab-content">
              {activeTab === 'browse' && (
                <div className="dp-browse-content">
                  {!selectedDiet ? (
                    <div className="dp-plans-grid">
                      {dietPlan.map((diet) => (
                        <div 
                          key={diet.slug} 
                          className="dp-plan-card" 
                          onClick={() => handleDietClick(diet)}
                        >
                          <div className="dp-plan-image">
                            <img
                              src={diet.image ? diet.image : "/fallback.jpg"}
                              alt={diet.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/fallback.jpg";
                              }}
                            />
                          </div>
                          <div className="dp-plan-content">
                            <h3>{diet.name}</h3>
                            <div className="dp-plan-description">
                              <p>{diet.description}</p>
                            </div>
                            {diet.benefits && (
                              <ul className="dp-benefits-list">
                                {diet.benefits.split('\n').map((benefit, i) => (
                                  <li key={i}>{benefit}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="dp-plan-footer">
                            <span className="dp-arrow-button">
                              View Plan
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Diet Detail View
                    <div className="dp-diet-detail-container">
                      <button className="dp-back-button" onClick={() => setSelectedDiet(null)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Browse</span>
                      </button>
                      
                      <div className="dp-diet-header">
                        <h1>{selectedDiet.name}</h1>
                        <p className="dp-diet-description">{selectedDiet.description}</p>
                      </div>

                      <div className="dp-diet-content">
                        <div className="dp-diet-main-info">
                          <div className="dp-diet-macros">
                            <div className="dp-macro-box">
                              <span className="dp-macro-value">{selectedDiet.protein_ratio}%</span>
                              <span className="dp-macro-label">Protein</span>
                            </div>
                            <div className="dp-macro-box">
                              <span className="dp-macro-value">{selectedDiet.carb_ratio}%</span>
                              <span className="dp-macro-label">Carbs</span>
                            </div>
                            <div className="dp-macro-box">
                              <span className="dp-macro-value">{selectedDiet.fat_ratio}%</span>
                              <span className="dp-macro-label">Fat</span>
                            </div>
                          </div>

                          {selectedDiet.benefits && (
                            <div className="dp-diet-benefits">
                              <h3>Benefits</h3>
                              <p>{selectedDiet.benefits}</p>
                            </div>
                          )}
                        </div>

                        {selectedDiet.types?.length > 0 && (
                          <div className="dp-diet-types-section">
                            <h2>Diet Types</h2>
                            <div className="dp-diet-types-grid">
                              {selectedDiet.types.map((type) => (
                                <div key={type.id} className="dp-diet-type-card" onClick={() => handleTypeClick(type)}>
                                  <h4>{type.name}</h4> <button
  className="dp-save-button"
  onClick={() => toggleSaveDietType(type.id)}
>
  {savedTypeIds.includes(type.id) ? 'Unsave' : 'Save'}
</button>
                                  

                                  <div className="dp-diet-type-info">
                                    <div className="dp-info-item">
                                      <span className="dp-info-label">Goal</span>
                                      <span className="dp-info-value">{type.goal}</span>
                                    </div>
                                    <div className="dp-info-item">
                                      <span className="dp-info-label">Foods</span>
                                      <span className="dp-info-value">{type.foods}</span>
                                    </div>
                                    <div className="dp-info-item">
                                      <span className="dp-info-label">Avoid</span>
                                      <span className="dp-info-value">{type.avoid}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="dp-saved-content">
                  {savedDiets.length > 0 ? (
                    <div className="dp-plans-grid">
                      {savedDiets.map((savedDiet) => (
                        <div 
                          key={savedDiet.id} 
                          className="dp-plan-card" 
                          onClick={() => handleDietClick(savedDiet.diet)}
                        >
                          <div className="dp-plan-image">
                            <img
                              src={savedDiet.diet.image ? savedDiet.diet.image : "/fallback.jpg"}
                              alt={savedDiet.diet.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/fallback.jpg";
                              }}
                            />
                          </div>
                          <div className="dp-plan-content">
                            <h3>{savedDiet.diet.name}</h3>
                            <div className="dp-plan-description">
                              <p>{savedDiet.diet.description}</p>
                            </div>
                            <div className="dp-saved-badge">
                              <span>Saved</span>
                            </div>
                          </div>
                          <div className="dp-plan-footer">
                            <span className="dp-arrow-button">
                              View Plan
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dp-empty-state">
                      <h3>No Saved Diets</h3>
                      <p>You haven't saved any diet plans yet. Browse our diet plans and save your favorites!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        
       
      </main>
      
      {/* Modals */}
      {selectedType && (
        <div className="dp-recipe-detail-modal">
          <div className="dp-recipe-detail-content">
            <button className="dp-close-button" onClick={() => setSelectedType(null)}>×</button>

            <h2>{selectedType.name}</h2>
            <p><strong>Goal:</strong> {selectedType.goal}</p>
            <p><strong>Foods:</strong> {selectedType.foods}</p>
            <p><strong>Avoid:</strong> {selectedType.avoid}</p>

            <h3 style={{ marginTop: '1.5rem' }}>Recipes</h3>
            {typeRecipes.length > 0 ? (
              <div className="dp-recipe-grid">
                {typeRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="dp-recipe-card"
                    onClick={() => handleRecipeClick(recipe)}
                  >
                    <img src={recipe.image} alt={recipe.title} className="dp-recipe-image" />
                    <div className="dp-recipe-card-content">
                      <h3>{recipe.title}</h3>
                      <div className="dp-recipe-quick-info">
                        <span>{recipe.prep_time} mins</span>
                        <span>{recipe.calories} kcal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recipes found for this type.</p>
            )}
          </div>
        </div>
      )}

      {selectedRecipe && (
        <div className="dp-recipe-detail-modal">
          <div className="dp-recipe-detail-content">
            <button className="dp-close-button" onClick={() => setSelectedRecipe(null)}>×</button>

            <h2>{selectedRecipe.title}</h2>
            <p>{selectedRecipe.description}</p>

            <div className="dp-macro-info">
              <p><strong>Prep Time:</strong> {selectedRecipe.prep_time} mins</p>
              <p><strong>Calories:</strong> {selectedRecipe.calories} kcal</p>
            </div>

            <h3>Instructions</h3>
            <ol>
              {selectedRecipe.steps?.map(step => (
                <li key={step.step_number}>{step.description}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Footer Section */}
          <footer className="footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-logo">
                  <h2>GymFreak</h2>
                  <p>Transform Your Fitness Journey</p>
                </div>
                <div className="footer-links">
                  <div className="footer-column">
                    <h3>Company</h3>
                    <ul>
                      <li><a href="#">About Us</a></li>
                      <li><a href="#">Careers</a></li>
                      <li><a href="#">Contact</a></li>
                    </ul>
                  </div>
                  <div className="footer-column">
                    <h3>Resources</h3>
                    <ul>
                      <li><a href="#">Blog</a></li>
                      <li><a href="#">Guides</a></li>
                      <li><a href="#">Support</a></li>
                    </ul>
                  </div>
                  <div className="footer-column">
                    <h3>Legal</h3>
                    <ul>
                      <li><a href="#">Privacy Policy</a></li>
                      <li><a href="#">Terms of Service</a></li>
                      <li><a href="#">Cookie Policy</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
            </div>
            <div className="footer-bottom" >
                <p style={{color : "white"}}>&copy; 2023 GymFreak. All rights reserved.</p>
              </div>
          </footer>
    </>
  );
};

export default DietPlan;