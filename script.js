// ===== SHOPPING CART =====
var cart = [];
var currentRecommendation = null;

function addToCart(name, price) {
    console.log('Adding to cart:', name, price);
    
    var existingItem = cart.find(function(item) {
        return item.name === name;
    });
    
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
    showNotification(name);
}

function updateCart() {
    var cartCount = document.getElementById('cartCount');
    var cartItems = document.getElementById('cartItems');
    var cartTotal = document.getElementById('cartTotal');
    
    if (!cartCount || !cartItems || !cartTotal) {
        console.error('Cart elements not found');
        return;
    }
    
    var totalItems = 0;
    for (var i = 0; i < cart.length; i++) {
        totalItems += cart[i].quantity;
    }
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        var html = '';
        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            html += '<div class="cart-item">';
            html += '<div class="cart-item-info">';
            html += '<h4>' + item.name + '</h4>';
            html += '<p>$' + item.price.toFixed(2) + ' each</p>';
            html += '</div>';
            html += '<div class="cart-item-actions">';
            html += '<div class="quantity-controls">';
            html += '<button class="qty-btn" onclick="updateQuantity(' + i + ', -1)">−</button>';
            html += '<span class="quantity">' + item.quantity + '</span>';
            html += '<button class="qty-btn" onclick="updateQuantity(' + i + ', 1)">+</button>';
            html += '</div>';
            html += '<button class="remove-btn" onclick="removeFromCart(' + i + ')">🗑️</button>';
            html += '</div>';
            html += '</div>';
        }
        cartItems.innerHTML = html;
    }
    
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].quantity;
    }
    cartTotal.textContent = '$' + total.toFixed(2);
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function toggleCart() {
    var cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown.classList.contains('active')) {
        cartDropdown.classList.remove('active');
    } else {
        cartDropdown.classList.add('active');
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    var total = 0;
    var itemsList = '';
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].quantity;
        itemsList += cart[i].quantity + 'x ' + cart[i].name + '\n';
    }
    
    alert('Order Summary:\n\n' + itemsList + '\nTotal: $' + total.toFixed(2) + '\n\nThank you for your order! 🌿');
    
    cart = [];
    updateCart();
    toggleCart();
}

function showNotification(itemName) {
    var notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 100px; right: 2rem; background: #00D084; color: white; padding: 1rem 1.5rem; border-radius: 50px; box-shadow: 0 10px 30px rgba(0, 208, 132, 0.3); z-index: 1001; font-weight: 600; font-family: DM Sans, sans-serif;';
    notification.textContent = '✓ ' + itemName + ' added to cart!';
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 2000);
}

function addRecommendedToCart() {
    if (currentRecommendation) {
        addToCart(currentRecommendation.name, 9.00);
    }
}

// ===== SMOOTH SCROLLING =====
function scrollToSection(sectionId) {
    var section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== AI RECOMMENDER =====
var userPreferences = {
    goal: '',
    dietary: '',
    flavor: ''
};

function initializeRecommender() {
    var optionButtons = document.querySelectorAll('.option-btn');
    
    for (var i = 0; i < optionButtons.length; i++) {
        optionButtons[i].addEventListener('click', function() {
            var question = this.closest('.question');
            var questionNum = question.dataset.question;
            var value = this.dataset.value;
            
            var buttons = question.querySelectorAll('.option-btn');
            for (var j = 0; j < buttons.length; j++) {
                buttons[j].classList.remove('selected');
            }
            
            this.classList.add('selected');
            
            if (questionNum === '1') {
                userPreferences.goal = value;
            } else if (questionNum === '2') {
                userPreferences.dietary = value;
            } else if (questionNum === '3') {
                userPreferences.flavor = value;
            }
            
            var self = this;
            setTimeout(function() {
                if (questionNum < 3) {
                    question.classList.remove('active');
                    var nextQuestion = document.querySelector('[data-question="' + (parseInt(questionNum) + 1) + '"]');
                    nextQuestion.classList.add('active');
                } else {
                    generateRecommendation();
                }
            }, 300);
        });
    }
}

function generateRecommendation() {
    document.getElementById('questionContainer').style.display = 'none';
    
    var resultsDiv = document.getElementById('aiResults');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<div style="text-align: center; padding: 3rem;"><h3>Generating your perfect smoothie... 🧠✨</h3></div>';
    
    setTimeout(function() {
        var recommendation = getFallbackRecommendation();
        displayRecommendation(recommendation);
    }, 1000);
}

function getFallbackRecommendation() {
    var recommendations = {
        'energy_tropical': {
            name: "Dallas Sunrise Energizer",
            description: "Packed with tropical fruits and natural energy boosters, this smoothie combines mango, pineapple, and a kick of ginger to jumpstart your day.",
            ingredients: ["Fresh Mango", "Pineapple", "Coconut Water", "Fresh Ginger", "Turmeric"],
            nutrition: { calories: "245", protein: "3 g", fiber: "4 g" },
            emoji: "🌅"
        },
        'immunity_berry': {
            name: "Immune Shield Berry Blast",
            description: "This antioxidant powerhouse features a triple-berry blend with açaí to strengthen your immune system.",
            ingredients: ["Blueberries", "Açaí", "Strawberries", "Banana", "Almond Milk"],
            nutrition: { calories: "280", protein: "5 g", fiber: "7 g" },
            emoji: "🫐"
        },
        'recovery_protein': {
            name: "Muscle Recovery Pro",
            description: "Designed for post-workout recovery, this protein-rich blend helps repair and build muscle.",
            ingredients: ["Peanut Butter", "Banana", "Oats", "Plant Protein", "Cacao", "Dates"],
            nutrition: { calories: "420", protein: "25 g", fiber: "8 g" },
            emoji: "💪"
        },
        'wellness_green': {
            name: "Green Wellness Elixir",
            description: "A nutrient-dense green smoothie that alkalizes and energizes your body.",
            ingredients: ["Spinach", "Kale", "Green Apple", "Cucumber", "Lemon", "Spirulina"],
            nutrition: { calories: "180", protein: "4 g", fiber: "6 g" },
            emoji: "🥬"
        }
    };
    
    var key = userPreferences.goal + '_' + userPreferences.flavor;
    return recommendations[key] || recommendations['energy_tropical'];
}

function displayRecommendation(recommendation) {
    currentRecommendation = recommendation;
    
    var gradients = {
        '🌅': 'linear-gradient(135deg, #FF6B35 0%, #FFC857 100%)',
        '🫐': 'linear-gradient(135deg, #FF006E 0%, #5A189A 100%)',
        '💪': 'linear-gradient(135deg, #5A189A 0%, #FF6B35 100%)',
        '🥬': 'linear-gradient(135deg, #00D084 0%, #3A86FF 100%)'
    };
    
    var gradient = gradients[recommendation.emoji] || gradients['🌅'];
    
    var ingredientsHtml = '';
    for (var i = 0; i < recommendation.ingredients.length; i++) {
        ingredientsHtml += '<li>' + recommendation.ingredients[i] + '</li>';
    }
    
    var html = '<div class="results-header">';
    html += '<h3>Your AI-Recommended Smoothie</h3>';
    html += '<button class="reset-btn" onclick="resetRecommender()">Start Over</button>';
    html += '</div>';
    html += '<div class="recommendation-card">';
    html += '<div class="rec-visual">';
    html += '<div class="smoothie-illustration" style="background: ' + gradient + '">' + recommendation.emoji + '</div>';
    html += '</div>';
    html += '<div class="rec-details">';
    html += '<h4>' + recommendation.name + '</h4>';
    html += '<p class="rec-description">' + recommendation.description + '</p>';
    html += '<div class="ingredients"><h5>Key Ingredients:</h5>';
    html += '<ul>' + ingredientsHtml + '</ul></div>';
    html += '<div class="nutrition"><h5>Nutritional Highlights:</h5>';
    html += '<div class="nutrition-grid">';
    html += '<div class="nutrition-item"><div class="nutrition-value">' + recommendation.nutrition.calories + '</div><div class="nutrition-label">Calories</div></div>';
    html += '<div class="nutrition-item"><div class="nutrition-value">' + recommendation.nutrition.protein + '</div><div class="nutrition-label">Protein</div></div>';
    html += '<div class="nutrition-item"><div class="nutrition-value">' + recommendation.nutrition.fiber + '</div><div class="nutrition-label">Fiber</div></div>';
    html += '</div></div>';
    html += '<button class="order-btn" onclick="addRecommendedToCart()">Order This Smoothie</button>';
    html += '</div></div>';
    
    document.getElementById('aiResults').innerHTML = html;
}

function resetRecommender() {
    userPreferences = { goal: '', dietary: '', flavor: '' };
    
    document.getElementById('aiResults').style.display = 'none';
    document.getElementById('questionContainer').style.display = 'block';
    
    var questions = document.querySelectorAll('.question');
    for (var i = 0; i < questions.length; i++) {
        questions[i].classList.remove('active');
        var buttons = questions[i].querySelectorAll('.option-btn');
        for (var j = 0; j < buttons.length; j++) {
            buttons[j].classList.remove('selected');
        }
    }
    document.querySelector('[data-question="1"]').classList.add('active');
}

// ===== CHATBOT =====
function initializeChatbot() {
    var chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

function askQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendMessage();
}

function sendMessage() {
    var input = document.getElementById('chatInput');
    var message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    var response = getChatbotResponse(message);
    setTimeout(function() {
        addMessage(response, 'bot');
    }, 500);
}

function getChatbotResponse(question) {
    var lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('vegan')) {
        return "All our smoothies can be made vegan! We use almond milk, coconut milk, or oat milk instead of dairy. Our Beauty Bloom contains collagen, but we can substitute with chia seeds for a vegan version.";
    } else if (lowerQ.includes('protein')) {
        return "Our Protein Power smoothie has the most protein at 25g! It includes plant-based protein powder, peanut butter, and oats. We can also add protein powder to any smoothie for an extra boost.";
    } else if (lowerQ.includes('sugar') || lowerQ.includes('keto')) {
        return "We can make sugar-free versions using our Green Machine as a base! We avoid added sugars and can customize any smoothie to be lower in natural fruit sugars.";
    } else if (lowerQ.includes('customize') || lowerQ.includes('change')) {
        return "Absolutely! You can customize any smoothie. Add or remove ingredients, change the milk base, add protein or collagen, adjust sweetness - we're here to make your perfect blend!";
    } else if (lowerQ.includes('allerg')) {
        return "Please let us know about any allergies! Our smoothies can contain tree nuts (almonds, coconut), peanuts, and soy (in some proteins). We clean equipment between orders to prevent cross-contamination.";
    } else {
        return "Great question! Our team would be happy to help you with that. Feel free to ask about specific smoothies, ingredients, nutrition info, or customization options!";
    }
}

function addMessage(text, type) {
    var messagesDiv = document.getElementById('chatMessages');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + type + '-message';
    
    var avatar = type === 'bot' ? '🌿' : '👤';
    messageDiv.innerHTML = '<div class="message-avatar">' + avatar + '</div><div class="message-content"><p>' + text + '</p></div>';
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing...');
    initializeRecommender();
    initializeChatbot();
    updateCart();
    console.log('All systems ready!');
});
