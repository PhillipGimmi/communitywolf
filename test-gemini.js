// Test script for Gemini API with web search capabilities
const GEMINI_API_KEY = 'AIzaSyCEkWR97LWJOEYCT5wvp1uPE8fhNSpdy7A';

async function testGeminiAPI() {
  console.log('�� Testing Gemini API with web search capabilities...\n');
  
  try {
    // Test 1: Basic text generation
    console.log('�� Test 1: Basic text generation...');
    const basicResponse = await callGeminiBasic('Explain how AI works in 3 sentences');
    console.log('✅ Basic response:', basicResponse.substring(0, 100) + '...\n');
    
    // Test 2: Web search with grounding
    console.log('�� Test 2: Web search with grounding...');
    const searchResponse = await callGeminiWithWebSearch('Find recent safety news in Cape Town, South Africa and summarize the key incidents');
    console.log('✅ Web search response:', searchResponse.substring(0, 200) + '...\n');
    
    // Test 3: Safety alerts generation
    console.log('🚨 Test 3: Safety alerts generation...');
    const alertsResponse = await callGeminiForAlerts('Generate 3 safety alerts based on recent crime news in Johannesburg');
    console.log('✅ Alerts response:', alertsResponse.substring(0, 200) + '...\n');
    
    console.log('🎉 All Gemini API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function callGeminiBasic(prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

async function callGeminiWithWebSearch(prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      },
      tools: [
        {
          search: {
            enableGrounding: true
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

async function callGeminiForAlerts(prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${prompt}

Return ONLY valid JSON in this exact format:
{
  "alerts": [
    {
      "id": "SA-2025-001",
      "title": "Alert title",
      "description": "Alert description",
      "severity": "low|medium|high|critical",
      "location": "Location",
      "timestamp": "${new Date().toISOString()}",
      "source": "Source name",
      "sourceUrl": "URL from search results",
      "alertType": "crime|safety|weather|traffic|emergency"
    }
  ]
}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1500
      },
      tools: [
        {
          search: {
            enableGrounding: true
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

// Run the test
testGeminiAPI().catch(console.error);
