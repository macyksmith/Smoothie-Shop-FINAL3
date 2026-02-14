// Shopping Cart Functionality
let cart = [];
let currentRecommendation = null;

function addToCart(name, price) {
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    updateCart();
    showCartNotification(name);
}

function addRecommendedToCart() {
    if (currentRecommendation) {
        addToCart(currentRecommendation.name, 9.00); // Default price for AI recommendations
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCart();
    }
}

function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function toggleCart() {
    const cartDropdown = document.getElementById('cartDropdown');
    cartDropdown.classList.toggle('active');
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.quantity}x ${item.name}`).join('\n');
    
    alert(`Order Summary:\n\n${itemsList}\n\nTotal: $${total.toFixed(2)}\n\nThank you for your order! 🌿\n\n(In a real app, this would process payment)`);
    
    // Clear cart
    cart = [];
    updateCart();
    toggleCart();
}

function showCartNotification(itemName) {
    // Simple notification that item was added
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        background: var(--primary-green);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(0, 208, 132, 0.3);
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
        font-weight: 600;
    `;
    notification.textContent = `✓ ${itemName} added to cart!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Smooth scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}

// AI Recommender Logic
let userPreferences = {
    goal: '',
    dietary: '',
    flavor: ''
};

let currentQuestion = 1;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeRecommender();
    initializeChatbot();
});

function initializeRecommender() {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const question = this.closest('.question');
            const questionNum = question.dataset.question;
            const value = this.dataset.value;
            
            // Remove previous selection
            question.querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Add selection
            this.classList.add('selected');
            
            // Store preference
            if (questionNum === '1') {
                userPreferences.goal = value;
            } else if (questionNum === '2') {
                userPreferences.dietary = value;
            } else if (questionNum === '3') {
                userPreferences.flavor = value;
            }
            
            // Move to next question or show results
            setTimeout(() => {
                if (questionNum < 3) {
                    question.classList.remove('active');
                    const nextQuestion = document.querySelector(`[data-question="${parseInt(questionNum) + 1}"]`);
                    nextQuestion.classList.add('active');
                } else {
                    generateRecommendation();
                }
            }, 300);
        });
    });
}

async function generateRecommendation() {
    // Hide questions
    document.getElementById('questionContainer').style.display = 'none';
    
    // Show loading state
    const resultsDiv = document.getElementById('aiResults');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<div style="text-align: center; padding: 3rem;"><h3>Generating your perfect smoothie... 🧠✨</h3></div>';
    
    // Call AI API to generate personalized recommendation
    try {
        const prompt = `Based on these preferences, recommend a smoothie:
Goal: ${userPreferences.goal}
Dietary: ${userPreferences.dietary}
Flavor: ${userPreferences.flavor}

Create a JSON response with:
{
  "name": "Smoothie Name",
  "description": "2-3 sentence description highlighting benefits",
  "ingredients": ["ingredient1", "ingredient2", "ingredient3", "ingredient4", "ingredient5"],
  "nutrition": {
    "calories": "number",
    "protein": "number g",
    "fiber": "number g"
  },
  "emoji": "relevant emoji for smoothie color/theme"
}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.content[0].text;
        
        // Parse JSON from response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const recommendation = jsonMatch ? JSON.parse(jsonMatch[0]) : getFallbackRecommendation();
        
        displayRecommendation(recommendation);
    } catch (error) {
        console.error('AI API Error:', error);
        // Use fallback recommendation
        const recommendation = getFallbackRecommendation();
        displayRecommendation(recommendation);
    }
}

function getFallbackRecommendation() {
    // Fallback recommendations based on preferences
    const recommendations = {
        energy_tropical: {
            name: "Dallas Sunrise Energizer",
            description: "Packed with tropical fruits and natural energy boosters, this smoothie combines mango, pineapple, and a kick of ginger to jumpstart your day. The turmeric adds anti-inflammatory benefits while coconut water keeps you hydrated.",
            ingredients: ["Fresh Mango", "Pineapple", "Coconut Water", "Fresh Ginger", "Turmeric"],
            nutrition: { calories: "245", protein: "3 g", fiber: "4 g" },
            emoji: "🌅"
        },
        immunity_berry: {
            name: "Immune Shield Berry Blast",
            description: "This antioxidant powerhouse features a triple-berry blend with açaí to strengthen your immune system. Rich in vitamin C and phytonutrients, it's your daily defense in a glass.",
            ingredients: ["Blueberries", "Açaí", "Strawberries", "Banana", "Almond Milk"],
            nutrition: { calories: "280", protein: "5 g", fiber: "7 g" },
            emoji: "🫐"
        },
        recovery_protein: {
            name: "Muscle Recovery Pro",
            description: "Designed for post-workout recovery, this protein-rich blend helps repair and build muscle. The combination of peanut butter, oats, and plant protein provides sustained energy and essential amino acids.",
            ingredients: ["Peanut Butter", "Banana", "Oats", "Plant Protein", "Cacao", "Dates"],
            nutrition: { calories: "420", protein: "25 g", fiber: "8 g" },
            emoji: "💪"
        },
        wellness_green: {
            name: "Green Wellness Elixir",
            description: "A nutrient-dense green smoothie that alkalizes and energizes your body. Packed with chlorophyll, vitamins, and minerals from fresh greens and spirulina for optimal wellness.",
            ingredients: ["Spinach", "Kale", "Green Apple", "Cucumber", "Lemon", "Spirulina"],
            nutrition: { calories: "180", protein: "4 g", fiber: "6 g" },
            emoji: "🥬"
        }
    };
    
    // Determine best match
    const key = `${userPreferences.goal}_${userPreferences.flavor}`;
    return recommendations[key] || recommendations.energy_tropical;
}

function displayRecommendation(recommendation) {
    // Store current recommendation for cart
    currentRecommendation = recommendation;
    
    const resultsDiv = document.getElementById('aiResults');
    
    document.getElementById('smoothieName').textContent = recommendation.name;
    document.getElementById('smoothieDescription').textContent = recommendation.description;
    
    // Display illustration
    const illustration = document.getElementById('smoothieIllustration');
    illustration.textContent = recommendation.emoji;
    illustration.style.background = getGradientForEmoji(recommendation.emoji);
    
    // Display ingredients
    const ingredientsList = document.getElementById('ingredientsList');
    ingredientsList.innerHTML = recommendation.ingredients
        .map(ing => `<li>${ing}</li>`)
        .join('');
    
    // Display nutrition
    const nutritionGrid = document.getElementById('nutritionGrid');
    nutritionGrid.innerHTML = `
        <div class="nutrition-item">
            <div class="nutrition-value">${recommendation.nutrition.calories}</div>
            <div class="nutrition-label">Calories</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-value">${recommendation.nutrition.protein}</div>
            <div class="nutrition-label">Protein</div>
        </div>
        <div class="nutrition-item">
            <div class="nutrition-value">${recommendation.nutrition.fiber}</div>
            <div class="nutrition-label">Fiber</div>
        </div>
    `;
    
    // Restore full results HTML
    resultsDiv.innerHTML = `
        <div class="results-header">
            <h3>Your AI-Recommended Smoothie</h3>
            <button class="reset-btn" onclick="resetRecommender()">Start Over</button>
        </div>
        <div class="recommendation-card">
            <div class="rec-visual">
                <div class="smoothie-illustration" id="smoothieIllustration" style="background: ${getGradientForEmoji(recommendation.emoji)}">${recommendation.emoji}</div>
            </div>
            <div class="rec-details">
                <h4>${recommendation.name}</h4>
                <p class="rec-description">${recommendation.description}</p>
                <div class="ingredients">
                    <h5>Key Ingredients:</h5>
                    <ul>${recommendation.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
                </div>
                <div class="nutrition">
                    <h5>Nutritional Highlights:</h5>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <div class="nutrition-value">${recommendation.nutrition.calories}</div>
                            <div class="nutrition-label">Calories</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${recommendation.nutrition.protein}</div>
                            <div class="nutrition-label">Protein</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${recommendation.nutrition.fiber}</div>
                            <div class="nutrition-label">Fiber</div>
                        </div>
                    </div>
                </div>
                <button class="order-btn">Order This Smoothie</button>
            </div>
        </div>
    `;
}

function getGradientForEmoji(emoji) {
    const gradients = {
        '🌅': 'linear-gradient(135deg, #FF6B35 0%, #FFC857 100%)',
        '🫐': 'linear-gradient(135deg, #FF006E 0%, #5A189A 100%)',
        '💪': 'linear-gradient(135deg, #5A189A 0%, #FF6B35 100%)',
        '🥬': 'linear-gradient(135deg, #00D084 0%, #3A86FF 100%)',
        '🍊': 'linear-gradient(135deg, #FFC857 0%, #FF6B35 100%)',
        '🥥': 'linear-gradient(135deg, #FF006E 0%, #FFC857 100%)'
    };
    return gradients[emoji] || gradients['🌅'];
}

function resetRecommender() {
    userPreferences = { goal: '', dietary: '', flavor: '' };
    currentQuestion = 1;
    
    document.getElementById('aiResults').style.display = 'none';
    document.getElementById('questionContainer').style.display = 'block';
    
    // Reset to first question
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('active');
        q.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    });
    document.querySelector('[data-question="1"]').classList.add('active');
}

// Chatbot functionality
function initializeChatbot() {
    const chatInput = document.getElementById('chatInput');
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function askQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingDiv = addMessage('Thinking...', 'bot');
    
    try {
        // Call AI API for response
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 500,
                messages: [{
                    role: 'user',
                    content: `You are a friendly nutritionist at Blend & Bloom smoothie shop in Dallas. Answer this customer question briefly and helpfully: ${message}
                    
Our menu includes:
- Dallas Sunrise (mango, pineapple, coconut, turmeric, ginger) - $8.50
- Antioxidant Armor (blueberries, açaí, strawberries, banana, almond milk) - $9.00
- Green Machine (spinach, kale, apple, cucumber, lemon, spirulina) - $8.00
- Protein Power (peanut butter, banana, oats, protein, cacao, dates) - $9.50
- Citrus Spark (orange, grapefruit, carrot, ginger, cayenne) - $7.50
- Beauty Bloom (dragon fruit, raspberry, chia, coconut milk, collagen) - $10.00

All smoothies can be customized. We use organic, locally-sourced ingredients when possible.`
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.content[0].text;
        
        // Remove typing indicator and add actual response
        typingDiv.remove();
        addMessage(aiResponse, 'bot');
    } catch (error) {
        console.error('Chatbot Error:', error);
        typingDiv.remove();
        addMessage(getFallbackChatResponse(message), 'bot');
    }
}

function getFallbackChatResponse(question) {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('vegan')) {
        return "All our smoothies can be made vegan! We use almond milk, coconut milk, or oat milk instead of dairy. Our Beauty Bloom contains collagen, but we can substitute with chia seeds for a vegan version.";
    } else if (lowerQ.includes('protein')) {
        return "Our Protein Power smoothie has the most protein at 25g! It includes plant-based protein powder, peanut butter, and oats. We can also add protein powder to any smoothie for an extra boost.";
    } else if (lowerQ.includes('sugar') || lowerQ.includes('keto')) {
        return "We can make sugar-free versions using our Green Machine as a base! We avoid added sugars and can customize any smoothie to be lower in natural fruit sugars. Just ask us to substitute greens for fruits.";
    } else if (lowerQ.includes('customize') || lowerQ.includes('change')) {
        return "Absolutely! You can customize any smoothie. Add or remove ingredients, change the milk base, add protein or collagen, adjust sweetness - we're here to make your perfect blend!";
    } else if (lowerQ.includes('allerg')) {
        return "Please let us know about any allergies! Our smoothies can contain tree nuts (almonds, coconut), peanuts, and soy (in some proteins). We clean equipment between orders to prevent cross-contamination.";
    } else {
        return "Great question! Our team would be happy to help you with that. Feel free to ask about specific smoothies, ingredients, nutrition info, or customization options. You can also call us at (214) 555-BLEND!";
    }
}

function addMessage(text, type) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${type === 'bot' ? '🌿' : '👤'}</div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return messageDiv;
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(section);
    });
});
