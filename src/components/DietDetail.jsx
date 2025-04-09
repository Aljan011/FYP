import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import '../css/DietDetail.css';

function DietDetail() {
  const { dietId } = useParams();
  const [diet, setDiet] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/diets/${dietId}/`)
      .then((response) => setDiet(response.data))
      .catch((error) => console.error(error));

    axios.get(`http://localhost:8000/api/recipes/?diet=${dietId}`)
      .then((response) => setRecipes(response.data))
      .catch((error) => console.error(error));
  }, [dietId]);

  if (!diet) return <p>Loading...</p>;

  return (
    <div className="diet-detail">
      <h1>{diet.name}</h1>
      <p>{diet.description}</p>

      <h2>Recipes</h2>
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <h3>{recipe.name}</h3>
            <p>{recipe.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DietDetail;
