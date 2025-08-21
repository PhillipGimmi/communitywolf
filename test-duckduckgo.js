// Test script for DuckDuckGo Instant Answer API (FREE, no API key needed)
async function testDuckDuckGo() {
  console.log('�� Testing DuckDuckGo Instant Answer API (FREE)...');
  
  try {
    const query = 'safety news crime incidents Cape Town South Africa recent';
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    console.log('Searching for:', query);
    console.log('URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`DuckDuckGo error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('\n✅ DuckDuckGo Results:');
    console.log(`Abstract: ${data.Abstract || 'No abstract'}`);
    console.log(`Abstract URL: ${data.AbstractURL || 'No URL'}`);
    console.log(`Abstract Source: ${data.AbstractSource || 'No source'}`);
    console.log(`Related Topics: ${data.RelatedTopics?.length || 0}`);
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      console.log('\nFirst few related topics:');
      data.RelatedTopics.slice(0, 3).forEach((topic, index) => {
        console.log(`${index + 1}. ${topic.Text || 'No text'} - ${topic.FirstURL || 'No URL'}`);
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ DuckDuckGo failed:', error.message);
    return null;
  }
}

// Test it
testDuckDuckGo().catch(console.error);
