/**
 * Swad Ghar Chatbot Configuration
 * 
 * To switch the chatbot from local rule-based responses to a live OpenAI model:
 * 1. Change `provider` to "openai".
 * 2. Add your OpenAI API key to `openaiApiKey`.
 * 3. (Optional) Customize the model name and system prompt.
 * 
 * IMPORTANT: In a production environment, API keys should be kept secure
 * and requests should be proxied through a backend to avoid exposing keys in the client-side code.
 */
const GUSTO_CHATBOT_CONFIG = {
    // Choice of provider: "local" (rule-based keyword parser) or "openai" (live completions api)
    provider: "local",

    // Your OpenAI API Key (only used if provider is "openai")
    openaiApiKey: "",

    // OpenAI settings
    openaiModel: "gpt-3.5-turbo",
    openaiEndpoint: "https://api.openai.com/v1/chat/completions",

    // Razorpay Test API Key
    razorpayKeyId: "rzp_test_Sy2YJnyfJ7irdp",

    // System prompt guiding the assistant's behavior when using OpenAI
    systemPrompt: `You are Swad Ghar AI Assistant, the friendly and professional conversational shopping assistant for Swad Ghar Restaurant. 
Your goals:
- Help users browse our menu and recommend dishes.
- Recommend complete meal combos (main dish, drink, dessert).
- Inform users about opening hours: Mon-Fri 10AM-11PM, Sat-Sun 9AM-Midnight.
- Address queries about delivery (free delivery on orders over ₹300, flat ₹40 delivery charge otherwise, delivers within 20-30 mins).
- Recommend healthy/organic dishes (Avocado Garden Medley, Chicken Caesar Salad, Mint Mojito) or calorie details.
- Handle complaints, support requests, or refund inquiries by directing customers to our support team at +91 8076437688 or deepakmahta858@gmail.com, or advising them to submit a message via the Contact Form at the bottom of the page.
- Provide friendly, concise, and professional responses. Feel delicious and food-focused! Keep answers relatively brief (1-3 sentences) unless listing menu recommendations.`
};
