package com.gustoglow.restaurant;

import com.gustoglow.restaurant.model.FoodItem;
import com.gustoglow.restaurant.model.Restaurant;
import com.gustoglow.restaurant.repository.FoodItemRepository;
import com.gustoglow.restaurant.repository.RestaurantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantRepository restaurantRepository;

    public DatabaseInitializer(FoodItemRepository foodItemRepository, RestaurantRepository restaurantRepository) {
        this.foodItemRepository = foodItemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (true) {
            System.out.println("Clearing old data and seeding H2 database with 6 restaurant branches and their specialty menu items...");
            
            foodItemRepository.deleteAll();
            restaurantRepository.deleteAll();

             // Seed 6 restaurants
             Restaurant r1 = restaurantRepository.save(new Restaurant(
                 "Swad Ghar - Delhi", "Connaught Place, New Delhi", 28.6139, 77.2090, "Multi-Cuisine", 4.8, "assets/hero_burger.png"
             ));
             Restaurant r2 = restaurantRepository.save(new Restaurant(
                 "Swad Ghar - Noida", "Sector 62, Noida", 28.5355, 77.3910, "Multi-Cuisine", 4.7, "assets/hero_pizza.png"
             ));
             Restaurant r3 = restaurantRepository.save(new Restaurant(
                 "Swad Ghar - Lucknow", "Hazratganj, Lucknow", 26.8467, 80.9462, "Multi-Cuisine", 4.6, "assets/fresh_salad.png"
             ));
             Restaurant r4 = restaurantRepository.save(new Restaurant(
                 "Swad Ghar - Mumbai", "Bandra West, Mumbai", 19.0760, 72.8777, "Multi-Cuisine", 4.9, "assets/hero_burger.png"
             ));
             Restaurant r5 = restaurantRepository.save(new Restaurant(
                 "Swad Ghar - Gujarat", "C.G. Road, Ahmedabad, Gujarat", 23.0225, 72.5714, "Multi-Cuisine", 4.5, "assets/hero_dessert.png"
             ));
             Restaurant r6 = restaurantRepository.save(new Restaurant(
                 "Swad Ghar - Pune", "Koregaon Park, Pune", 18.5204, 73.8567, "Multi-Cuisine", 4.7, "assets/drinks.png"
             ));

            // Seed Restaurant 1 - Burgers & Grill (Town Center)
            foodItemRepository.save(new FoodItem(
                "Double Cheddar Deluxe", "burgers", 249.00, 5, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
                "Juicy double beef patty, melted cheddar cheese, fresh tomatoes, lettuce, brioche bun.", "Best Seller", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Bacon BBQ Smokehouse", "burgers", 289.00, 4, "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80",
                "Crispy hickory bacon, smoky barbecue sauce, caramelized onions, Swiss cheese slice.", "Signature", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Truffle Parmesan Fries", "burgers", 149.00, 5, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
                "Crispy golden potatoes tossed in white truffle oil and grated Italian parmesan.", "Crispy Side", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Crispy Chicken Slider", "burgers", 199.00, 4, "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80",
                "Crispy fried chicken breast, spicy mayo, dill pickles on soft sliders.", "New", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Smokehouse Onion Rings", "burgers", 129.00, 4, "https://images.unsplash.com/photo-1639024471283-2da7b3c6a267?auto=format&fit=crop&w=600&q=80",
                "Colossal sweet onions, double-battered and served with chipotle ranch.", "Crispy Side", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Classic Beef Cheeseburger", "burgers", 179.00, 5, "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
                "Single flame-grilled beef patty, American cheese, pickles, mustard, ketchup.", "Classic", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Spicy Maharaja Veggie Burger", "burgers", 189.00, 5, "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80",
                "Crispy double-layer vegetable patty, topped with spicy cocktail sauce, lettuce, cheese, and jalapeños.", "Local Legend", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Paneer Fusion Burger", "burgers", 149.00, 5, "assets/paneer_fusion_burger.png",
                "Indian fusion burger with a crispy paneer patty, tandoori sauce, lettuce, tomato, cheese slice.", "Chef Special", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Tikka Chicken Burger", "burgers", 219.00, 5, "assets/tikka_chicken_burger.png",
                "Juicy chicken tikka burger, flame-grilled tikka breast, sliced red onion, green chutney, melted cheese, brioche bun.", "Signature", r1.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Spicy Aloo Crunch Burger", "burgers", 99.00, 4, "assets/aloo_crunch_burger.png",
                "Crispy potato patty burger, sweet tamarind chutney, mint spread, sliced onions, sesame bun.", "Popular", r1.getId()
            ));

            // Seed Restaurant 2 - Pizzas & Pasta (Bank More)
            foodItemRepository.save(new FoodItem(
                "Artisanal Pepperoni", "pizzas", 399.00, 5, "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
                "Rustic pepperoni, bubbling mozzarella cheese, robust house-made marinara sauce.", "Top Rated", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Veggie Supreme Woodfired", "pizzas", 349.00, 4, "https://images.unsplash.com/photo-1571066811602-71683a3f680d?auto=format&fit=crop&w=600&q=80",
                "Sweet bell peppers, mushrooms, red onions, kalamata olives, sweet corn kernels.", "Vegetarian", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Margherita Basilico", "pizzas", 299.00, 5, "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=80",
                "Classic Neapolitan style. Sweet tomato sauce, fresh mozzarella, extra virgin olive oil, basil.", "Heritage", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Creamy Alfredo Fettuccine", "pizzas", 249.00, 4, "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80",
                "Rich garlic parmesan cream sauce tossed with fettuccine pasta and fresh parsley.", "Classic", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Garlic Breadsticks with Cheese", "pizzas", 139.00, 5, "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80",
                "Oven-baked breadsticks brushed with garlic butter, melted mozzarella, marinara dip.", "Popular", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Tuscan Sun Pizza", "pizzas", 429.00, 5, "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
                "Sun-dried tomatoes, goat cheese, roasted garlic, caramelized onions, fresh arugula.", "Premium", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Tandoori Paneer Pizza", "pizzas", 329.00, 5, "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
                "Spiced paneer cubes, red onions, capsicum, green chilies, and creamy tandoori sauce on a thin crust.", "Fusion", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Spicy Penne Arrabbiata", "pizzas", 239.00, 4, "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80",
                "Penne pasta in a fiery tomato sauce with garlic, chili flakes, and fresh basil.", "Fiery Taste", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Paneer Tikka Pizza", "pizzas", 349.00, 5, "assets/paneer_tikka_pizza.png",
                "Artisanal wood-fired pizza topped with charred paneer tikka cubes, red onions, green capsicum, fresh coriander, mozzarella.", "Fusion", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Masala Butter Chicken Pizza", "pizzas", 399.00, 5, "assets/butter_chicken_pizza.png",
                "Gourmet thin-crust pizza topped with creamy butter chicken gravy, pulled tandoori chicken, red onion rings, mozzarella.", "Signature", r2.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Cheesy Corn & Onion Pizza", "pizzas", 249.00, 4, "assets/corn_onion_pizza.png",
                "Crispy hand-tossed pizza loaded with sweet golden corn kernels, red onion slices, bubbling mozzarella, garlic herb oil.", "Popular", r2.getId()
            ));

            // Seed Restaurant 3 - Salad & Healthy (Sahijna)
            foodItemRepository.save(new FoodItem(
                "Avocado Garden Medley", "salads", 229.00, 5, "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
                "Creamy avocado slices, cherry tomatoes, cucumbers, mixed greens, light olive oil dressing.", "Organic", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Grilled Chicken Caesar", "salads", 249.00, 4, "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80",
                "Flame-grilled chicken breast, crisp romaine, shredded parmesan, garlic herb croutons.", "Classic", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Quinoa & Roasted Veggie", "salads", 219.00, 5, "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80",
                "Fluffy tri-color quinoa, warm roasted sweet potatoes, zucchini, spinach, tahini dressing.", "Healthy", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Mediterranean Chickpea Salad", "salads", 199.00, 4, "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
                "Garbanzo beans, kalamata olives, feta cheese, cucumber, mint, lemon oil dressing.", "Fresh", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Green Goddess Wrap", "salads", 179.00, 4, "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=600&q=80",
                "Whole wheat tortilla filled with mixed greens, avocado, cucumber, sprouts, green dressing.", "Healthy", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Berry Spinach Power Salad", "salads", 209.00, 5, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                "Baby spinach, fresh strawberries, blueberries, toasted almonds, balsamic glaze.", "Superfood", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Gusto Club Sandwich", "salads", 149.00, 4, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
                "Triple-layer sandwich with fresh cucumber, tomato, lettuce, cheese, and spicy mint mayo dressing.", "Fresh Choice", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Spiced Chickpea Salad", "salads", 129.00, 5, "assets/spiced_chickpea_salad.png",
                "Healthy chickpea salad bowl (chana chaat) with chopped cucumbers, tomatoes, red onions, green chilies, lemon dressing.", "Fresh", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Paneer & Quinoa Bowl", "salads", 199.00, 4, "assets/paneer_quinoa_bowl.png",
                "Superfood salad bowl with fluffy tri-color quinoa, grilled paneer tikka cubes, cherry tomatoes, spinach, honey mustard.", "Healthy", r3.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Crunchy Peanut Salad", "salads", 119.00, 4, "assets/crunchy_peanut_salad.png",
                "Fresh peanut salad with crispy chopped cabbage, carrots, bell peppers, roasted salted peanuts, sesame ginger dressing.", "Popular", r3.getId()
            ));

            // Seed Restaurant 4 - Desi & Spice (Nagwa)
            foodItemRepository.save(new FoodItem(
                "Butter Chicken & Garlic Naan", "desi", 349.00, 5, "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
                "Tender chicken tikka cooked in rich tomato butter gravy, served with hot garlic naan.", "Best Seller", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Paneer Tikka Masala", "desi", 299.00, 4, "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
                "Charred paneer cubes simmered in a spiced onion tomato bell pepper gravy.", "Vegetarian", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Mutton Biryani Special", "desi", 399.00, 5, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
                "Fragrant long-grain basmati rice cooked with tender mutton and select Mughlai spices.", "Heritage", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Dal Makhani & Jeera Rice", "desi", 229.00, 5, "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?auto=format&fit=crop&w=600&q=80",
                "Slow-cooked black lentils enriched with cream and butter, served with cumin rice.", "Classic", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Crispy Vegetable Samosas", "desi", 40.00, 4, "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80",
                "Golden fried pastry stuffed with spiced potatoes and peas, served with sweet chutney.", "Crispy Side", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Tandoori Chicken Platter", "desi", 329.00, 5, "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
                "Chicken legs marinated in yogurt and tandoori spices, char-grilled to perfection.", "Hot Spicy", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Traditional Bread Pakoda", "desi", 50.00, 5, "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=600&q=80",
                "Spiced mashed potato sandwich dipped in seasoned gram flour batter and deep-fried, served with mint and tamarind chutney.", "Teatime Classic", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Gujarati Khaman Dhokla", "desi", 70.00, 5, "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
                "Soft, fluffy steamed savory gram flour cakes tempered with mustard seeds, green chilies, and curry leaves.", "Steamed Healthy", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Aloo Tikki Chaat", "desi", 80.00, 5, "assets/aloo_tikki_chaat.png",
                "Plate of crispy golden aloo tikki chaat, topped with sweet yogurt, mint chutney, tamarind chutney, pomegranate, and sev.", "Street Style", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Masala Dosa", "desi", 120.00, 5, "assets/masala_dosa.png",
                "Crispy golden masala dosa crepe, rolled and filled with spiced potato masala, served with sambhar and coconut chutney.", "Heritage", r4.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Chole Bhature Special", "desi", 140.00, 5, "assets/chole_bhature.png",
                "A plate of spicy chole (chickpea curry) garnished with ginger, served with two large fluffy fried bhature breads.", "Signature", r4.getId()
            ));

            // Seed Restaurant 5 - Bakery & Desserts (Chiniya Road)
            foodItemRepository.save(new FoodItem(
                "Chocolate Lava Eruption", "desserts", 149.00, 5, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
                "Decadent dark chocolate cake with warm, molten chocolate fudge oozing from the center.", "Indulgent", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Strawberry Dream Waffle", "desserts", 169.00, 4, "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=600&q=80",
                "Belgian waffles topped with fresh sliced strawberries, maple syrup, and whipped cream.", "Specialty", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Blueberry Velvet Cheesecake", "desserts", 189.00, 5, "https://images.unsplash.com/photo-1524351199679-46cddf530c04?auto=format&fit=crop&w=600&q=80",
                "Creamy baked NY cheesecake topped with sweet wild blueberry compote.", "Chef Special", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Warm Apple Pie & Ice Cream", "desserts", 159.00, 4, "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80",
                "Classic spiced apple filling in flaky crust, served with a scoop of vanilla bean ice cream.", "Classic", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Cinnamon Rolls Freshly Baked", "desserts", 129.00, 5, "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80",
                "Warm cinnamon rolls with brown sugar filling, drizzled with vanilla cream cheese icing.", "Sweet Treat", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Decadent Tiramisu Slice", "desserts", 179.00, 5, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
                "Italian sponge cake soaked in coffee liqueur, layered with mascarpone custard.", "Traditional", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Warm Gulab Jamun Trio", "desserts", 90.00, 5, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
                "Three soft, melt-in-the-mouth milk solid dumplings fried and soaked in cardamom-flavored sugar syrup.", "Traditional Sweet", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Rasmalai Cream", "desserts", 110.00, 5, "assets/rasmalai_cream.png",
                "Soft cottage cheese patties soaked in saffron-flavored sweet milk, garnished with pistachios and almond slivers.", "Premium Sweet", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Kaju Katli Platter", "desserts", 180.00, 5, "assets/kaju_katli.png",
                "Traditional diamond-shaped premium cashew fudge sweets coated with delicate silver foil.", "Heritage", r5.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Saffron Jalebi", "desserts", 90.00, 5, "assets/saffron_jalebi.png",
                "Crispy spiral fried batter soaked in hot saffron sugar syrup, served fresh and warm.", "Traditional Sweet", r5.getId()
            ));

            // Seed Restaurant 6 - Chinese & Asian (Pipar Kala)
            foodItemRepository.save(new FoodItem(
                "Szechuan Chili Noodles", "chinese", 199.00, 5, "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
                "Wok-tossed noodles in fiery Szechuan chili oil sauce with sweet bell peppers and scallions.", "Hot Spicy", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Sweet & Sour Chicken Glaze", "chinese", 249.00, 4, "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
                "Battered chicken chunks tossed with sweet pineapple, onions, and bell peppers.", "Popular", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Steamed Ginger Dumplings", "chinese", 149.00, 5, "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
                "Minced vegetable and chicken dumplings steamed with aromatic ginger soy dipping sauce.", "Top Rated", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Golden Fried Spring Rolls", "chinese", 129.00, 4, "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
                "Crispy rolls stuffed with sautéed cabbage, carrots, mushrooms, served with plum sauce.", "Crispy Side", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Thai Green Curry with Rice", "chinese", 299.00, 5, "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=600&q=80",
                "Aromatic green curry paste coconut milk with bamboo shoots, basil, and chicken breast.", "New Curry", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Chili Garlic Hakka Noodles", "chinese", 179.00, 4, "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80",
                "Stir-fried noodles tossed with fresh vegetables, garlic, chili paste, and light soy sauce.", "Street Style", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Veg Manchurian Gravy", "chinese", 159.00, 5, "assets/veg_manchurian.png",
                "Fried mixed vegetable balls tossed in a rich, glossy sweet, sour, and spicy soy-garlic sauce.", "Popular", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Chili Paneer Dry", "chinese", 189.00, 5, "assets/chili_paneer.png",
                "Crispy paneer cubes stir-fried with bell peppers, red onions, garlic, and hot soy-chili sauce.", "Popular", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Veg Fried Rice", "chinese", 139.00, 4, "assets/veg_fried_rice.png",
                "Classic wok-tossed basmati rice with finely chopped carrots, green beans, peas, and fresh spring onions.", "Classic", r6.getId()
            ));

            foodItemRepository.save(new FoodItem(
                "Classic Lime Mint Mojito", "drinks", 119.00, 5, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
                "Freshly muddled mint, key lime slices, brown sugar, bubbly club soda, crushed ice.", "Refreshing", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Tropical Mango Blast", "drinks", 129.00, 4, "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80",
                "Organic mango nectar blended with exotic passion fruit juices and iced soda water.", "Specialty", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Mango Lassi", "drinks", 89.00, 5, "assets/mango_lassi.png",
                "Thick, creamy sweet yogurt drink blended with fresh alphonsa mango pulp, saffron, and pistachios.", "Refreshing", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Masala Chai", "drinks", 49.00, 5, "assets/masala_chai.png",
                "Traditional Indian spiced hot milk tea brewed with fresh cardamom, ginger, cloves, and loose tea leaves.", "Teatime", r6.getId()
            ));
            foodItemRepository.save(new FoodItem(
                "Sweet Rose Sherbet", "drinks", 79.00, 4, "assets/rose_sherbet.png",
                "Refreshing chilled rose-flavored milk drink topped with soaked basil seeds (sabja) and rose petals.", "Specialty", r6.getId()
            ));

            System.out.println("Seeding of 6 restaurants and 66 food items completed successfully!");
        }
    }
}
