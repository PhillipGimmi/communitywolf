import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Country ID is required' },
        { status: 400 }
      );
    }

    // Fetch country data from Supabase
    const { data: country, error } = await supabase
      .from('countries')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error) {
      console.error('Error fetching country:', error);
      return NextResponse.json(
        { error: 'Failed to fetch country data' },
        { status: 500 }
      );
    }

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(country);
  } catch (error) {
    console.error('Unexpected error in countries API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
