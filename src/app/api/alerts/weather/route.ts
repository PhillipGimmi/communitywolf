import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty array - no hardcoded weather alerts
    const weatherAlerts: never[] = [];
    
    console.log('✅ Weather Alerts API: No hardcoded alerts returned');
    
    return NextResponse.json(weatherAlerts);
    
  } catch (error) {
    console.error('❌ Weather Alerts API: Error occurred:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch weather alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
