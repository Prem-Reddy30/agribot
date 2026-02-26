import Groq from 'groq-sdk';

export default async function handler(req, res) {
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
            try {
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
            } catch (aiError) {
                console.error('Groq API error:', aiError);
                response = getFallbackResponse(message, language);
            }
        } else {
            response = getFallbackResponse(message, language);
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
}

function getFallbackResponse(message, language) {
    const lowerMessage = message.toLowerCase();

    const responses = {
        en: {
            greeting: "🌾 **Welcome to KrishiSahay!**\n\nI'm your AI agricultural assistant. I can help you with:\n\n- 🌱 **Crop cultivation advice**\n- 🐛 **Pest & disease management**\n- 💧 **Irrigation techniques**\n- 📊 **Market prices & trends**\n- 🌤️ **Weather-based farming advice**\n\nWhat would you like to know today?",
            rice: "🌾 **Rice Cultivation Guide:**\n\n1. Use high-quality seeds\n2. Maintain proper water levels (2-3 inches)\n3. Apply balanced fertilizer (NPK 4:2:1)\n4. Monitor for pests like brown planthopper\n\nWhat specific aspect of rice farming would you like to know more about?",
            wheat: "🌾 **Wheat Farming Tips:**\n\n1. Sow in November-December\n2. Use seed rate of 100kg/acre\n3. Apply DAP fertilizer at sowing\n4. Irrigate at crown root initiation and flowering stages\n\nNeed more specific advice?",
            pest: "🐛 **Common Pest Management:**\n\n1. Use neem oil spray\n2. Introduce ladybugs for natural control\n3. Remove infected plants promptly\n4. Maintain proper spacing between plants\n\nWhich specific pest are you dealing with?",
            default: "🌾 I can help you with **crop selection**, **pest management**, **irrigation techniques**, **fertilizer recommendations**, **weather-based farming advice**, and **market information**.\n\nPlease ask me a specific farming question!"
        },
        hi: {
            greeting: "🌾 **कृषिसहाय में आपका स्वागत है!**\n\nमैं आपका AI कृषि सहायक हूं। आज मैं आपकी कृषि जरूरतों में कैसे मदद कर सकता हूं?",
            default: "🌾 मैं आपकी **फसल चयन**, **कीट प्रबंधन**, **सिंचाई तकनीक**, **उर्वरक सिफारिश**, और **बाजार जानकारी** में मदद कर सकता हूं।\n\nकृपया अपना कृषि प्रश्न बताएं!"
        }
    };

    const langResponses = responses[language] || responses.en;

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('नमस्ते')) {
        return langResponses.greeting || langResponses.default;
    } else if (lowerMessage.includes('rice') || lowerMessage.includes('धान') || lowerMessage.includes('paddy')) {
        return langResponses.rice || langResponses.default;
    } else if (lowerMessage.includes('wheat') || lowerMessage.includes('गेहूं')) {
        return langResponses.wheat || langResponses.default;
    } else if (lowerMessage.includes('pest') || lowerMessage.includes('bug') || lowerMessage.includes('insect') || lowerMessage.includes('कीट')) {
        return langResponses.pest || langResponses.default;
    }

    return langResponses.default;
}
