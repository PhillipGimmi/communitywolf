// Debug script to see what DuckDuckGo is actually returning
async function testDuckDuckGoDebug() {
  console.log('�� Debugging DuckDuckGo Search...\n');
  
  const queries = [
    'crime news Cape Town',
    'safety incidents South Africa',
    'police reports Johannesburg',
    'breaking news South Africa'
  ];
  
  for (const query of queries) {
    console.log(`\n--- Testing Query: "${query}" ---`);
    
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`   HTTP Error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`   Abstract: ${data.Abstract ? 'Yes' : 'No'}`);
      console.log(`   Abstract URL: ${data.AbstractURL || 'None'}`);
      console.log(`   Related Topics: ${data.RelatedTopics?.length || 0}`);
      
      if (data.Abstract) {
        console.log(`   Abstract Text: ${data.Abstract.substring(0, 150)}...`);
      }
      
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        console.log('   First 3 Related Topics:');
        data.RelatedTopics.slice(0, 3).forEach((topic, index) => {
          console.log(`     ${index + 1}. ${topic.Text || 'No text'} - ${topic.FirstURL || 'No URL'}`);
        });
      }
      
      // Check if we got any usable results
      const hasResults = (data.Abstract && data.AbstractURL) || (data.RelatedTopics && data.RelatedTopics.length > 0);
      console.log(`   Has Results: ${hasResults ? '✅' : '❌'}`);
      
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
}

// Run the debug test
testDuckDuckGoDebug().catch(console.error);
