# 🍽️ Swad Ghar - Online Restaurant Website

**Swad Ghar** is a premium, state-of-the-art online restaurant website featuring multi-branch selection, real-time proximity-based sorting, dynamic menu rendering, dine-in table reservations, and an interactive conversational AI shopping assistant (JioMart-style chatbot).

The application is powered by a robust **Spring Boot** Java backend and a modern, responsive HTML/CSS/JS frontend.

---

## ✨ Key Features

### 💬 JioMart-Style Conversational AI Chatbot
- **AI Item Search**: Query food items (e.g., `"search pizza"`, `"find samosa"`) to receive matching interactive product cards with direct `+ Add` buttons inside the chat bubble.
- **Conversational Add to Cart**: Type `"add Margherita Pizza"` or `"buy samosa"` to automatically add items to your shopping cart.
- **Cart Summary**: Type `"cart"` or `"basket"` to view an itemized list of your added meals, quantity, subtotal, and total in Indian Rupees (₹).
- **Asynchronous Order Tracking**: Type `"track SWAD-XXXXXX"` or ask `"where is my order?"` to fetch live tracking status directly from the database (e.g. *Placed*, *Preparing*, *Ready for Rider*, *Out for Delivery*, *Serving*, *Completed*).

### 🏢 Multi-Branch Proximity Routing
- Includes 6 branches: **Delhi, Noida, Lucknow, Mumbai, Gujarat, and Pune**.
- Select your city, and the frontend dynamically calculates distances (in km) to all branches, sorting the nearest branch first and auto-selecting it.

### 🍽️ Dine-In Reservations
- Seamless checkout toggle between **Home Delivery** and **Dine-In**.
- Selecting Dine-In automatically waives delivery fees (₹40) and prompts for reservation details: Table Selection, Guest Count, and Dine-In Time.

### 👤 Profile Settings
- Quick-access settings modal for logged-in customers to update their Full Name, Phone Number, and Delivery Address.

### 🚴 Admin & Rider Portals
- **Admin Dashboard** (`/admin.html`): View real-time sales metrics, revenue in Rupees (₹), transacted orders, Dine-in reservation alerts, and advance order status.
- **Rider Portal** (`/rider.html`): Allows delivery riders to select their profile, view available pick-ups, accept active deliveries, navigate using embedded Leaflet maps, and check their 5% profit margins.

---

## 🛠️ Technology Stack

* **Backend**: Spring Boot, Spring Data JPA, H2 Database (Auto-seeding with 66 food items on start)
* **Frontend**: HTML5, Vanilla CSS3 (with theme toggles for Dark/Light mode), Vanilla JavaScript (ES6+)
* **Dependencies**: Razorpay checkout API, Leaflet map API, FontAwesome icons, Google Fonts

---

## 🚀 Getting Started

### Prerequisites
- Java JDK 17 or higher
- Maven 3.6+

### Execution Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/DEEPAK-KUMAR002/Swad-ghar--online-restaurant-website-.git
   cd Swad-ghar--online-restaurant-website-
   ```
2. Build and run the Spring Boot server:
   ```bash
   mvn spring-boot:run
   ```
3. Open your browser and visit:
   - **Storefront**: `http://localhost:8080`
   - **Admin Dashboard**: `http://localhost:8080/admin.html`
   - **Rider Portal**: `http://localhost:8080/rider.html`
   - **H2 Database Console**: `http://localhost:8080/h2-console`
