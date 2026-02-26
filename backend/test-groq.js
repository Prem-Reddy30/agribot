const Groq = require('groq-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function test() {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'user', content: 'Say hello' }
            ],
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        });
        console.log('SUCCESS:', completion.choices[0].message.content);
    } catch (error) {
        console.error('FAILED:', error);
    }
}

test();
