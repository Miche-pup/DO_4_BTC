// src/app/api/ideas/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Ensure NextRequest is imported for GET
import { supabase } from '@/lib/supabase/config'; // Make sure this path is correct

export async function POST(request: Request) { // Using 'Request' from global scope is fine for POST body
  console.log('--- [API LOG] POST /api/ideas endpoint HIT ---');
  try {
    const body = await request.json();
    console.log('--- [API LOG] Received request body:', JSON.stringify(body, null, 2));

    // Destructure ALL fields you expect from the form, including lightning_address
    const {
      title,
      description,
      submitter_name,
      lightning_address, // Make sure to destructure this
      tags
    } = body;

    // New validation for title
    if (typeof title !== 'string' || title.trim().length === 0) {
      console.log('--- [API LOG] Validation FAILED: Title is invalid or empty.');
      return NextResponse.json({ error: 'Catchy Headline is required and cannot be empty.' }, { status: 400 });
    }
    // New validation for description
    if (typeof description !== 'string' || description.trim().length === 0) {
      console.log('--- [API LOG] Validation FAILED: Description is invalid or empty.');
      return NextResponse.json({ error: '"How can we add value to Bitcoin?" field is required and cannot be empty.' }, { status: 400 });
    }

    // Optional: Validate Lightning Address format
    if (lightning_address && (typeof lightning_address !== 'string' || !lightning_address.includes('@') || lightning_address.trim().length === 0)) {
        console.log('--- [API LOG] Validation FAILED: Invalid or empty Lightning Address format.');
        return NextResponse.json({ error: 'Invalid Lightning Address format. It should look like user@domain.com and not be empty if provided.' }, { status: 400 });
    }

    // Use trimmed values for insertion
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    // Construct ideaData
    const ideaData: {
      title: string;
      description: string;
      submitter_name?: string;
      lightning_address?: string; // Include this
      tags?: string[];
    } = {
      title: trimmedTitle,
      description: trimmedDescription,
    };

    if (submitter_name && typeof submitter_name === 'string' && submitter_name.trim().length > 0) {
      ideaData.submitter_name = submitter_name.trim();
    }

    // Add lightning_address to ideaData if provided and valid
    if (lightning_address && typeof lightning_address === 'string' && lightning_address.trim().length > 0) {
        ideaData.lightning_address = lightning_address.trim();
    }


    if (Array.isArray(tags) && tags.length > 0) {
      const cleanTags = tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
      if (cleanTags.length > 0) {
        ideaData.tags = cleanTags; // Only add if there are non-empty tags
      }
    }

    console.log('--- [API LOG] Data to be inserted into Supabase:', JSON.stringify(ideaData, null, 2));

    // Insert into Supabase
    // Using .single() with .select() can be good if you expect exactly one row.
    // If you want the array of inserted rows (even if it's one), just .select() is fine.
    const { data: insertedData, error: insertError } = await supabase
      .from('ideas')
      .insert(ideaData)
      .select()
      .single(); // .single() will error if 0 or >1 rows are affected by insert and select.

    if (insertError) {
      console.error('--- [API LOG] Supabase INSERT ERROR:', JSON.stringify(insertError, null, 2));
      return NextResponse.json({ error: 'Failed to submit idea. Please try again later.', details: insertError.message }, { status: 500 });
    }

    // Check if insertedData is null or not what you expect, even if no error
    if (!insertedData) {
        console.error('--- [API LOG] Supabase insert did not return data, though no explicit error reported.');
        return NextResponse.json({ error: 'Failed to confirm idea submission. No data returned.' }, { status: 500 });
    }

    console.log('--- [API LOG] Idea CREATED SUCCESSFULLY in Supabase:', JSON.stringify(insertedData, null, 2));
    // Return the specific fields you want, or the whole object
    return NextResponse.json(insertedData, { status: 201 });

  } catch (err) {
    console.error('--- [API LOG] CATCH BLOCK ERROR in POST /api/ideas:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    let errorDetails = {};
       if (err instanceof Error) {
           errorDetails = { name: err.name, stack: err.stack }; // Include stack for more debug info
       }
    console.error('--- [API LOG] CATCH BLOCK ERROR DETAILS:', JSON.stringify(errorDetails, null, 2));
    return NextResponse.json({ error: 'Internal server error.', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid limit value (must be 1-100)' }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    const { data: ideas, count, error } = await supabase
      .from('ideas')
      .select('*', { count: 'exact' })
      .order('total_sats_received', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch ideas', details: error.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);
    return NextResponse.json({ ideas, currentPage: page, totalPages, totalIdeas: count }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}