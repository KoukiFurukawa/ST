import { NextResponse } from 'next/server';

export async function POST() { // Assuming your Python API uses POST
    try {
        const externalResponse = await fetch('https://st-kdaz.onrender.com/get_answer_ids/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify({}), // If your Python API expects a body
        });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            console.error('External API error (get_forms_and_answers):', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch forms and answers from external API', details: errorText },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();
        return NextResponse.json(responseData);

    } catch (error) {
        console.error('API route error (get_forms_and_answers):', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
        return NextResponse.json(
            { error: 'Internal server error while fetching forms and answers', details: errorMessage },
            { status: 500 }
        );
    }
}
