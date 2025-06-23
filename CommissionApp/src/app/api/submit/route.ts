'use server';

// app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const requestData = await req.json();

        console.log('受信したデータ:', requestData);

        const externalResponse = await fetch('https://st-kdaz.onrender.com/upload_data/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            return NextResponse.json(
                { error: '外部APIからエラーが返されました', details: errorText },
                { status: externalResponse.status }
            );
        }

        // Fetchのみ実行
        fetch("http://localhost:8080/message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body : JSON.stringify({
                message: "新しい委任状が公開されました",
                channel_id: "1329621965945700385"
            })
        })

        const responseData = await externalResponse.json();
        return NextResponse.json(responseData);
    } catch (error) {
        console.error('エラー:', error);
        return NextResponse.json(
            { error: 'サーバーエラーが発生しました' },
            { status: 500 }
        );
    }
}
