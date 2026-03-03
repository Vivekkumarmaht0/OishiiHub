document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('recipe-search-input');
    const searchBtn = document.getElementById('recipe-search-btn');
    const resultsHeading = document.getElementById('recipe-results-heading');
    
    // Initial load: Fetch "Arrabiata" as default search like user requested.
    fetchRecipes('Arrabiata');

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        fetchRecipes(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            fetchRecipes(query);
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRecipeModal();
        }
    });

    // Close modal on outside click
    document.getElementById('recipe-modal').addEventListener('click', (e) => {
        if (e.target.id === 'recipe-modal') {
            closeRecipeModal();
        }
    });
});

let currentMeals = []; // Keep a reference to current searched meals

async function fetchRecipes(query) {
    const grid = document.getElementById('recipe-grid');
    const heading = document.getElementById('recipe-results-heading');
    
    grid.innerHTML = `<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> Loading recipes...</div>`;
    
    // If query is empty, default to Arrabiata
    if(!query) query = 'Arrabiata';
    
    heading.innerText = `Search Results for "${query}"`;

    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        
        currentMeals = data.meals || [];
        
        renderRecipes(currentMeals);
    } catch (error) {
        console.error("Failed to fetch recipes:", error);
        grid.innerHTML = `<div class="loading-state" style="color:#ff4757;">Failed to load recipes. Please try again later.</div>`;
    }
}

function renderRecipes(meals) {
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '';
    
    if (meals.length === 0) {
        grid.innerHTML = `<div class="loading-state">No recipes found. Try a different search!</div>`;
        return;
    }

    meals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.onclick = () => openRecipeModal(meal.idMeal);
        
        // Truncate title if too long
        const title = meal.strMeal.length > 30 ? meal.strMeal.substring(0, 27) + "..." : meal.strMeal;
        
        card.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="recipe-card-content">
                <div class="recipe-card-tag">${meal.strCategory} • ${meal.strArea}</div>
                <h3 class="recipe-card-title">${title}</h3>
                <div class="recipe-card-footer">
                    <span class="view-recipe-btn">View Recipe &rarr;</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function openRecipeModal(id) {
    const meal = currentMeals.find(m => m.idMeal === id);
    if (!meal) return;
    
    const modalContent = document.getElementById('recipe-modal-content');
    
    // Extract ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push(measure ? `${measure} ${ingredient}` : ingredient);
        }
    }
    
    const ingredientsHtml = ingredients.map(ing => `<li>${ing}</li>`).join('');
    
    modalContent.innerHTML = `
        <div class="modal-img-col">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="youtube-link"><i class="fab fa-youtube"></i> Watch Video Tutorial</a>` : ''}
        </div>
        <div class="modal-info-col">
            <h2>${meal.strMeal}</h2>
            <div class="modal-meta">
                <span><i class="fas fa-utensils"></i> ${meal.strCategory}</span>
                <span><i class="fas fa-globe"></i> ${meal.strArea}</span>
            </div>
            
            <div class="ingredients-list">
                <h3>Ingredients</h3>
                <ul>
                    ${ingredientsHtml}
                </ul>
            </div>
        </div>
        <div class="instructions-col">
            <h3>Instructions</h3>
            <p>${meal.strInstructions}</p>
        </div>
    `;
    
    document.getElementById('recipe-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeRecipeModal() {
    document.getElementById('recipe-modal').classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore background scrolling
}
