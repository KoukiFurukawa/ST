// Copyright (c) 2025 古川幸樹
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。 

import { NextResponse } from 'next/server';
import { FormTemplate } from '@/lib/interfaces';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
  }

  try {
    // Fetch all forms from the external API
    const externalResponse = await fetch('https://st-kdaz.onrender.com/get_data/', {
      method: 'POST', // As per your setup for fetching all forms
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({}), // Add body if your external API route expects it for get_all_forms
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error('External API error (get_all_forms for single form lookup):', errorText);
      if (externalResponse.status === 404) {
          return NextResponse.json({ error: 'Form data source not available or empty.' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Failed to fetch forms from external API', details: errorText },
        { status: externalResponse.status }
      );
    }

    const responseData = await externalResponse.json();
    
    if (!Array.isArray(responseData)) {
        console.error("Received non-array response from external API when fetching all forms:", responseData);
        return NextResponse.json(
            { error: 'Invalid data format from external API when fetching all forms.' },
            { status: 500 }
        );
    }
    
    // Map to FormTemplate structure and convert created_at
    const allForms: FormTemplate[] = responseData.map((form: any) => ({
        id: form.id,
        title: form.title,
        description: form.description,
        recipientName: form.recipientName,
        recipientAddress: form.recipientAddress,
        created_at: typeof form.created_at === 'string' ? new Date(form.created_at).getTime() : Number(form.created_at),
        open: form.open,
    }));

    // Find the specific form by ID
    const form = allForms.find(f => f.id === id);

    if (!form) {
      return NextResponse.json({ error: 'Form not found with the specified ID' }, { status: 404 });
    }

    return NextResponse.json(form);

  } catch (error) {
    console.error(`API route error (getform/${id}):`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { error: 'Internal server error while fetching form details', details: errorMessage },
      { status: 500 }
    );
  }
}
