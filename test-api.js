import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing API...');
    
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, I need help with my crops',
        conversationHistory: [],
        language: 'en'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
