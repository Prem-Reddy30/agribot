async function test() {
    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Hello',
                language: 'en',
                conversationHistory: []
            })
        });
        const data = await response.json();
        console.log('RESPONSE:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('ERROR:', error);
    }
}

test();
