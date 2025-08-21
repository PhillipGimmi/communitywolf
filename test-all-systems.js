// Comprehensive test script for Supabase, DuckDuckGo, and OpenRouter
require('dotenv/config');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testAllSystems() {
  console.log('🧪 Testing All Systems: Supabase, DuckDuckGo, and OpenRouter\n');
  
  try {
    // Test 1: Supabase Connection
    console.log('🔗 Test 1: Supabase Connection...');
    const supabaseTest = await testSupabase();
    console.log(supabaseTest ? '✅ Supabase: Connected' : '❌ Supabase: Failed');
    
    // Test 2: DuckDuckGo Web Search
    console.log('\n�� Test 2: DuckDuckGo Web Search...');
    const ddgTest = await testDuckDuckGo();
    console.log(ddgTest ? '✅ DuckDuckGo: Working' : '❌ DuckDuckGo: Failed');
    
    // Test 3: OpenRouter LLM
    console.log('\n�� Test 3: OpenRouter LLM...');
    const openRouterTest = await testOpenRouter();
    console.log(openRouterTest ? '✅ OpenRouter: Working' : '❌ OpenRouter: Failed');
    
    // Test 4: Full Integration Test
    if (supabaseTest && ddgTest && openRouterTest) {
      console.log('\n🎯 Test 4: Full Integration Test...');
      await testFullIntegration();
    }
    
    console.log('\n📊 Test Summary:');
    console.log(`Supabase: ${supabaseTest ? '✅' : '❌'}`);
    console.log(`DuckDuckGo: ${ddgTest ? '✅' : '❌'}`);
    console.log(`OpenRouter: ${openRouterTest ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testSupabase() {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.log('⚠️ Missing Supabase environment variables');
      return false;
    }
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/crime_reports?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Found ${data.length} crime reports`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testDuckDuckGo() {
  try {
    const query = 'safety news crime incidents Cape Town South Africa recent';
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const resultsCount = (data.RelatedTopics?.length || 0) + (data.Abstract ? 1 : 0);
    
    console.log(`   Found ${resultsCount} search results`);
    if (data.Abstract) {
      console.log(`   Abstract: ${data.Abstract.substring(0, 100)}...`);
    }
    
    return resultsCount > 0;
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testOpenRouter() {
  try {
    if (!OPENROUTER_API_KEY) {
      console.log('⚠️ Missing OPENROUTER_API_KEY');
      return false;
    }
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://safety-news-app.com',
        'X-Title': 'Safety News App'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, I am working!" in exactly 5 words.'
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    console.log(`   Response: "${content}"`);
    return content && content.includes('Hello');
  } catch (error) {
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testFullIntegration() {
  try {
    console.log('   Testing complete flow...');
    
    // 1. Get search results from DuckDuckGo
    const searchQuery = 'safety news crime incidents Cape Town South Africa recent';
    const searchResults = await performDuckDuckGoSearch(searchQuery);
    
    if (searchResults.length === 0) {
      console.log('   ⚠️ No search results to test with');
      return;
    }
    
    console.log(`   Got ${searchResults.length} search results`);
    
    // 2. Send to OpenRouter for formatting
    const context = `Generate 2 safety alerts based on these search results:

${searchResults.map((result, index) => 
  `Result ${index + 1}:
Title: ${result.title}
URL: ${result.url}
Content: ${result.snippet}`
).join('\n\n')}

Return ONLY valid JSON in this format:
{
  "alerts": [
    {
      "id": "SA-2025-001",
      "title": "Alert title",
      "description": "Description",
      "severity": "medium",
      "location": "Cape Town",
      "timestamp": "${new Date().toISOString()}",
      "source": "Source name",
      "sourceUrl": "URL from results above",
      "alertType": "crime"
    }
  ]
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://safety-news-app.com',
        'X-Title': 'Safety News App'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a safety analyst. Return valid JSON only.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (content) {
      const parsed = JSON.parse(content);
      console.log(`   Generated ${parsed.alerts?.length || 0} alerts`);
      console.log('   ✅ Full integration test successful!');
    }
    
  } catch (error) {
    console.log(`   ❌ Integration test failed: ${error.message}`);
  }
}

async function performDuckDuckGoSearch(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`DuckDuckGo search failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    const results = [];
    
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Abstract,
        url: data.AbstractURL,
        source: data.AbstractSource || 'DuckDuckGo',
        snippet: data.Abstract
      });
    }
    
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.forEach((topic) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text,
            url: topic.FirstURL,
            source: 'DuckDuckGo Related',
            snippet: topic.Text
          });
        }
      });
    }
    
    return results.slice(0, 5);
    
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

// Run the comprehensive test
testAllSystems().catch(console.error);
