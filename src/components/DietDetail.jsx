import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../css/DietDetail1.css';

function DietDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [diet, setDiet] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [typeRecipes, setTypeRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const headers = token ? { Authorization: `token ${token}` } : {};

    const fetchDietAndRecipes = async () => {
      try {
        console.log("Fetching diet using slug:", slug);
        const dietResponse = await axios.get(
          `http://localhost:8000/api/diets/${slug}/`,
          { headers }
        );
        setDiet(dietResponse.data);
        console.log("Fetched diet:", dietResponse.data);

        const recipeResponse = await axios.get(
          `http://localhost:8000/api/recipes/by_diet/?diet_id=${dietResponse.data.id}`,
          { headers }
        );
        setRecipes(recipeResponse.data);
        console.log("Fetched recipes:", recipeResponse.data);
      } catch (err) {
        console.error("Failed to fetch diet or recipes:", err);
        setError("Failed to load data. Please try again later.");
      }
    };

    if (slug) {
      fetchDietAndRecipes();
    }
  }, [slug]);

  

   

  
  
  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

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


  if (error) return <div className="error-message">{error}</div>;
  if (!diet) return <div className="loading">Loading...</div>;

  return (
    <div className="diet-detail-container">
      <button className="back-button" onClick={handleGoBack}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>
      
      <div className="diet-header">
        <h1>{diet.name}</h1>
        <p className="diet-description">{diet.description}</p>
      </div>

      <div className="diet-content">
        <div className="diet-main-info">
          <div className="diet-macros">
            <div className="macro-box">
              <span className="macro-value">{diet.protein_ratio}%</span>
              <span className="macro-label">Protein</span>
            </div>
            <div className="macro-box">
              <span className="macro-value">{diet.carb_ratio}%</span>
              <span className="macro-label">Carbs</span>
            </div>
            <div className="macro-box">
              <span className="macro-value">{diet.fat_ratio}%</span>
              <span className="macro-label">Fat</span>
            </div>
          </div>

          {diet.benefits && (
            <div className="diet-benefits">
              <h3>Benefits</h3>
              <p>{diet.benefits}</p>
            </div>
          )}
        </div>

        {diet.types?.length > 0 && (
          <div className="diet-types-section">
            <h2>Diet Types</h2>
            <div className="diet-types-grid">
              {diet.types.map((type) => (
                <div key={type.id} className="diet-type-card" onClick={() => handleTypeClick(type)}>
                  <h4>{type.name}</h4>
                  <div className="diet-type-info">
                    <div className="info-item">
                      <span className="info-label">Goal</span>
                      <span className="info-value">{type.goal}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Foods</span>
                      <span className="info-value">{type.foods}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Avoid</span>
                      <span className="info-value">{type.avoid}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedType && (
  <div className="recipe-detail-modal">
    <div className="recipe-detail-content">
      <button className="close-button" onClick={() => setSelectedType(null)}>×</button>

      <h2>{selectedType.name}</h2>
      <p><strong>Goal:</strong> {selectedType.goal}</p>
      <p><strong>Foods:</strong> {selectedType.foods}</p>
      <p><strong>Avoid:</strong> {selectedType.avoid}</p>

      <h3 style={{ marginTop: '1.5rem' }}>Recipes</h3>
      {typeRecipes.length > 0 ? (
        <div className="recipe-grid">
          {typeRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="recipe-card"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("authToken");
                  const headers = token ? { Authorization: `Token ${token}` } : {};
                  const response = await axios.get(`http://localhost:8000/api/recipes/${recipe.id}/`, { headers });
                  setSelectedRecipe(response.data);
                } catch (err) {
                  console.error("Failed to load full recipe:", err);
                }
              }}
            >
              <img src={recipe.image} alt={recipe.title} className="recipe-image" />
              <div className="recipe-card-content">
                <h3>{recipe.title}</h3>
                <div className="recipe-quick-info">
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
  <div className="recipe-detail-modal">
    <div className="recipe-detail-content">
      <button className="close-button" onClick={() => setSelectedRecipe(null)}>×</button>

      <h2>{selectedRecipe.title}</h2>
      <p>{selectedRecipe.description}</p>

      <div className="macro-info">
        <p><strong>Prep Time:</strong> {selectedRecipe.prep_time} mins</p>
        <p><strong>Calories:</strong> {selectedRecipe.calories} kcal</p>
      </div>

      <h3>Instructions</h3>
      <ol>
        {selectedRecipe.steps?.map(step => (
          <li key={step.step_number}>{step.description}</li>
        ))}
      </ol>

      {/* <h3>Ingredients</h3>
      <ul>
        {selectedRecipe.ingredients?.map((ing, idx) => (
          <li key={idx}>{ing.quantity} {ing.name}</li>
        ))}
      </ul> */}
    </div>
  </div>
)}


    </div>
  );
}

export default DietDetail;