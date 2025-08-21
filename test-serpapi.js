// Test script for SerpAPI (Google Search Results)
const SERPAPI_KEY = '5fc9bf83d7709155ebb9c65c7e33ea8e62b9132dd43d1ab4a7ee672da9d48c80';

async function testSerpAPI() {
  console.log('🔍 Testing SerpAPI (Google Search Results)...\n');
  
  try {
    const query = 'crime news Cape Town South Africa recent';
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=5`;
    
    console.log('Searching for:', query);
    console.log('URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ SerpAPI Results:');
    console.log(`Status: ${data.search_metadata?.status || 'Unknown'}`);
    console.log(`Organic Results: ${data.organic_results?.length || 0}`);
    console.log(`News Results: ${data.news_results?.length || 0}`);
    
    if (data.organic_results && data.organic_results.length > 0) {
      console.log('\nFirst 3 Organic Results:');
      data.organic_results.slice(0, 3).forEach((result, index) => {
        console.log(`${index + 1}. ${result.title || 'No title'}`);
        console.log(`   URL: ${result.link || 'No URL'}`);
        console.log(`   Snippet: ${(result.snippet || 'No snippet').substring(0, 100)}...`);
      });
    }
    
    if (data.news_results && data.news_results.length > 0) {
      console.log('\nNews Results:');
      data.news_results.slice(0, 2).forEach((result, index) => {
        console.log(`${index + 1}. ${result.title || 'No title'}`);
        console.log(`   URL: ${result.link || 'No URL'}`);
        console.log(`   Source: ${result.source || 'Unknown'}`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ SerpAPI failed:', error.message);
    return null;
  }
}

// Test it
testSerpAPI().catch(console.error);
