'use client';

import { FormTemplate } from "./interfaces";

export const handleSubmit = async (data: FormTemplate) => {
    const res = await fetch('/api/submit/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log(result);
};