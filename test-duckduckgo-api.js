// Test script using DuckDuckGo API with your API key
const DUCKDUCKGO_API_KEY = '5fc9bf83d7709155ebb9c65c7e33ea8e62b9132dd43d1ab4a7ee672da9d48c80';

async function testDuckDuckGoAPI() {
  console.log(' Testing DuckDuckGo API with your key...\n');
  
  const queries = [
    'crime news Cape Town South Africa',
    'safety incidents Johannesburg',
    'police reports South Africa recent',
    'breaking news Cape Town today'
  ];
  
  for (const query of queries) {
    console.log(`\n--- Testing Query: "${query}" ---`);
    
    try {
      // Using DuckDuckGo's proper search API
      const url = `https://api.duckduckgo.com/v1/search?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&api_key=${DUCKDUCKGO_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`   HTTP Error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`   Abstract: ${data.Abstract ? 'Yes' : 'No'}`);
      console.log(`   Abstract URL: ${data.AbstractURL || 'None'}`);
      console.log(`   Related Topics: ${data.RelatedTopics?.length || 0}`);
      console.log(`   Results: ${data.Results?.length || 0}`);
      
      if (data.Abstract) {
        console.log(`   Abstract Text: ${data.Abstract.substring(0, 150)}...`);
      }
      
      if (data.Results && data.Results.length > 0) {
        console.log('   First 3 Results:');
        data.Results.slice(0, 3).forEach((result, index) => {
          console.log(`     ${index + 1}. ${result.Title || 'No title'} - ${result.FirstURL || 'No URL'}`);
        });
      }
      
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        console.log('   First 3 Related Topics:');
        data.RelatedTopics.slice(0, 3).forEach((topic, index) => {
          console.log(`     ${index + 1}. ${topic.Text || 'No text'} - ${topic.FirstURL || 'No URL'}`);
        });
      }
      
      // Check if we got any usable results
      const hasResults = (data.Abstract && data.AbstractURL) || 
                        (data.Results && data.Results.length > 0) || 
                        (data.RelatedTopics && data.RelatedTopics.length > 0);
      console.log(`   Has Results: ${hasResults ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Also test the Instant Answer API as fallback
async function testDuckDuckGoInstantAnswer() {
  console.log('\n\n Testing DuckDuckGo Instant Answer API (fallback)...\n');
  
  try {
    const query = 'crime news Cape Town South Africa';
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`   Abstract: ${data.Abstract ? 'Yes' : 'No'}`);
    console.log(`   Abstract URL: ${data.AbstractURL || 'None'}`);
    console.log(`   Related Topics: ${data.RelatedTopics?.length || 0}`);
    
    if (data.Abstract) {
      console.log(`   Abstract Text: ${data.Abstract.substring(0, 150)}...`);
    }
    
    const hasResults = (data.Abstract && data.AbstractURL) || (data.RelatedTopics && data.RelatedTopics.length > 0);
    console.log(`   Has Results: ${hasResults ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
}

// Run both tests
async function runAllTests() {
  await testDuckDuckGoAPI();
  await testDuckDuckGoInstantAnswer();
}

runAllTests().catch(console.error);
