// Copyright (c) 2025 古川幸樹
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。 

import { NextResponse } from 'next/server';

export async function POST() { // Assuming your Python API /get_answer_ids/ uses POST
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
            console.error('External API error (get_answer_ids):', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch all answers from external API', details: errorText },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();
        return NextResponse.json(responseData);

    } catch (error) {
        console.error('API route error (getallanswers):', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
        return NextResponse.json(
            { error: 'Internal server error while fetching all answers', details: errorMessage },
            { status: 500 }
        );
    }
}
