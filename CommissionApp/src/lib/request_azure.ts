/* Copyright (c) 2025 古川幸樹 */
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */

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