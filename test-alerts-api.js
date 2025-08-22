async function testAlertsAPI() {
  console.log('🧪 Testing Alerts Generation API...\n');
  
  const testData = {
    location: "Coetzenberg Way, Edgemead, Milnerton, City of Cape Town, Western Cape, South Africa",
    radius: 5,
    coordinates: {
      lat: -33.8568,
      lng: 18.6283
    },
    userCountry: "South Africa"
  };
  
  console.log('📤 Sending test request with data:', JSON.stringify(testData, null, 2));
  console.log('\n⏱️  Starting API call (timeout: 25s)...\n');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3000/api/alerts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Response received in ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ SUCCESS! API Response:');
      console.log(`📊 Generated ${data.alerts?.length || 0} alerts`);
      
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach((alert, index) => {
          console.log(`\n🚨 Alert ${index + 1}:`);
          console.log(`   ID: ${alert.id}`);
          console.log(`   Title: ${alert.title}`);
          console.log(`   Severity: ${alert.severity}`);
          console.log(`   Area: ${alert.area}`);
          console.log(`   Source: ${alert.source}`);
        });
      }
    } else {
      const errorData = await response.text();
      console.log('\n❌ ERROR! API Response:');
      console.log(errorData);
    }
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️  Error occurred after ${duration}ms`);
    console.log('\n❌ ERROR! Request failed:');
    console.log(error.message);
  }
}

// Check if running locally
console.log('🔧 Make sure your Next.js dev server is running on http://localhost:3000');
console.log('🔧 Ensure your environment variables are set (OPENROUTER_API_KEY, SERPAPI_KEY)');
console.log('');

testAlertsAPI();
