import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const zoom = searchParams.get('zoom') || '18';

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude parameters are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of valid range' },
        { status: 400 }
      );
    }

    console.log('🔧 Reverse Geocoding API: Looking up coordinates:', latitude, longitude);

    // Build the Nominatim API URL
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/reverse');
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('lat', lat);
    nominatimUrl.searchParams.set('lon', lon);
    nominatimUrl.searchParams.set('zoom', zoom);
    nominatimUrl.searchParams.set('addressdetails', '1');
    nominatimUrl.searchParams.set('accept-language', 'en');

    // Make the request to Nominatim
    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'SafetyNewsApp/1.0 (https://safety-news-app.com)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('🔧 Reverse Geocoding API: Nominatim response not ok:', response.status);
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: 503 }
      );
    }

    const data = await response.json();
    console.log('🔧 Reverse Geocoding API: Found address:', data.display_name);

    // Transform the data to a cleaner format
    const result = {
      display_name: data.display_name,
      lat: data.lat,
      lon: data.lon,
      type: data.type,
      address: data.address || {},
      boundingbox: data.boundingbox,
    };

    return NextResponse.json({
      coordinates: { lat: latitude, lon: longitude },
      result,
    });

  } catch (error) {
    console.error('🔧 Reverse Geocoding API: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
