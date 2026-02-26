const Groq = require('groq-sdk');

module.exports = async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, conversationHistory = [], language = 'en' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GROQ_API_KEY;

        // System prompts per language
        const systemPrompts = {
            en: "You are KrishiSahay, an AI specialized in agriculture. Format your answers clearly with emojis, bullet points, bold headings, and short paragraphs for readability. Always provide structured advice. Use icons like 🌾, 🐛, 🚜, 💧 where appropriate.",
            hi: "आप कृषिसहाय हैं, कृषि में विशेषज्ञ। अपनी उत्तरों को इमोजी, बुलेट पॉइंट्स, बोल्ड हेडिंग्स और छोटे अनुच्छेदों के साथ स्पष्ट रूप से प्रारूपित करें। 🌾, 🐛, 🚜 जैसे आइकन का उपयोग करें।",
            te: "మీరు కృషిసహాయ, వ్యవసాయ నిపుణులు. ఎమోజీలు, బుల్లెట్ పాయింట్లు మరియు బోల్డ్ హెడ్డింగ్లతో మీ సమాధానాలను అందంగా ఫార్మాట్ చేయండి. 🌾, 🚜 వంటి చిహ్నాలను వాడండి.",
            ta: "நீங்கள் கிருஷிசஹாய், வேளாண் நிபுணர். எமோஜிகள், புல்லட் பாயிண்டுகள் மற்றும் தலைப்புகளுடன் பதிலளிக்கவும். 🌾, 🐛, 🚜 போன்றவற்றை பயன்படுத்துங்கள்.",
            ml: "നിങ്ങൾ കൃഷിസഹായ, കൃഷി വിദഗ്ധൻ. ഇമോജികൾ, ബുള്ളറ്റ് പോയിന്റുകൾ, ബോൾഡ് ഹെഡിംഗുകൾ എന്നിവ ഉപയോഗിച്ച് മറുപടി നൽകുക."
        };

        let response = '';

        if (apiKey) {
            const groq = new Groq({ apiKey });
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompts[language] || systemPrompts.en },
                    ...conversationHistory,
                    { role: 'user', content: message }
                ],
                model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 1024,
            });
            response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
        } else {
            // Fallback mock responses
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                response = "🌾 **Welcome to KrishiSahay!**\n\nI'm your AI agricultural assistant. I can help you with:\n\n- 🌱 **Crop cultivation advice**\n- 🐛 **Pest & disease management**\n- 💧 **Irrigation techniques**\n- 📊 **Market prices & trends**\n- 🌤️ **Weather-based farming advice**\n\nWhat would you like to know today?";
            } else {
                response = "🌾 I can help you with crop selection, pest management, irrigation techniques, fertilizer recommendations, weather-based farming advice, and market information. Please ask me a specific farming question!";
            }
        }

        return res.status(200).json({
            response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({
            error: 'Failed to process chat request',
            details: error.message
        });
    }
};
