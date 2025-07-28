// Copyright (c) 2025 古川幸樹
// このソースコードは自由に使用、複製、改変、再配布することができます。
// ただし、著作権表示は削除しないでください。 

import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const externalResponse = await fetch('https://st-kdaz.onrender.com/get_data/', {
            method: 'POST', // Or 'GET' if the external API supports it and it's more appropriate
            headers: {
                // Add any necessary headers for the external API call
                // 'Content-Type': 'application/json', // If sending a body
            },
            // body: JSON.stringify({}), // If the external API expects a body for POST
        });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            console.error('External API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to fetch forms from external API', details: errorText },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();
        return NextResponse.json(responseData);

    } catch (error) {
        console.error('API route error:', error);
        // Check if error is an instance of Error to safely access message property
        const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
        return NextResponse.json(
            { error: 'Internal server error while fetching forms', details: errorMessage },
            { status: 500 }
        );
    }
}
