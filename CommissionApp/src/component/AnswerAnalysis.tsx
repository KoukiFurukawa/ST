import React, { useState, useEffect } from 'react';
import { FormTemplate, Answer } from '@/lib/interfaces';
import Swal from 'sweetalert2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AnswerAnalysis() {
    const [forms, setForms] = useState<FormTemplate[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [formChartData, setFormChartData] = useState<Map<string, {formTitle: string, data: {name: string, count: number}[]}>>(new Map());
    const [totalChartData, setTotalChartData] = useState<{name: string, count: number}[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch forms and answers concurrently
                const [formsResponse, answersResponse] = await Promise.all([
                    fetch('/api/getforms', { method: 'POST' }),
                    fetch('/api/getallanswers', { method: 'POST' })
                ]);

                if (!formsResponse.ok) {
                    const errorData = await formsResponse.json();
                    throw new Error(`Failed to fetch forms: ${errorData.details || formsResponse.statusText}`);
                }
                if (!answersResponse.ok) {
                    const errorData = await answersResponse.json();
                    throw new Error(`Failed to fetch answers: ${errorData.details || answersResponse.statusText}`);
                }

                const formsData: FormTemplate[] = await formsResponse.json();
                const answersData: Answer[] = await answersResponse.json();
                
                // Process data
                const processedForms = (formsData || []).map(form => ({
                    ...form,
                    created_at: typeof form.created_at === 'string' ? new Date(form.created_at).getTime() : Number(form.created_at),
                }));
                const processedAnswers = (answersData || []).map(answer => ({
                    ...answer,
                    created_at: typeof answer.created_at === 'string' ? new Date(answer.created_at).getTime() : Number(answer.created_at),
                }));

                setForms(processedForms || []);
                setAnswers(processedAnswers || []);
                
                // Generate chart data
                processChartData(processedForms, processedAnswers);

            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'データ取得エラー',
                    text: error instanceof Error ? error.message : 'データの取得中にエラーが発生しました。',
                });
                setForms([]);
                setAnswers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Process data to count commissions by recipient for each form
    const processChartData = (forms: FormTemplate[], answers: Answer[]) => {
        // Filter to include only published forms
        const publishedForms = forms.filter(form => form.open);
        
        // Map to store recipient counts across all forms (for total chart)
        const totalRecipientCounts: Map<string, number> = new Map();
        
        // Map to store recipient counts per form
        const formRecipientCounts: Map<string, Map<string, number>> = new Map();
        const formTitles: Map<string, string> = new Map();
        
        // First, set up form data structures (only for published forms)
        publishedForms.forEach(form => {
            formRecipientCounts.set(form.id, new Map<string, number>());
            formTitles.set(form.id, form.title);
        });
        
        // Set of published form IDs for quick lookup
        const publishedFormIds = new Set(publishedForms.map(form => form.id));
        
        // Process each answer - only for published forms
        answers.forEach(answer => {
            // Skip if the form isn't published
            if (!publishedFormIds.has(answer.commissionID)) return;
            
            try {
                // Try to parse the answer content
                const answerContent = JSON.parse(answer.answer);
                const formId = answer.commissionID;
                
                if (answerContent.recipientName && formRecipientCounts.has(formId)) {
                    // Get recipient name
                    const recipientName = answerContent.recipientName;
                    
                    // Update per-form count
                    const formCounts = formRecipientCounts.get(formId) || new Map<string, number>();
                    formCounts.set(
                        recipientName,
                        (formCounts.get(recipientName) || 0) + 1
                    );
                    
                    // Update total count
                    totalRecipientCounts.set(
                        recipientName,
                        (totalRecipientCounts.get(recipientName) || 0) + 1
                    );
                }
            } catch (e) {
                // Skip if answer content is not valid JSON
                console.log("Could not parse answer content:", e);
            }
        });
        
        // Convert the total map to an array for the total chart
        const totalData = Array.from(totalRecipientCounts.entries()).map(([name, count]) => ({
            name,
            count
        })).sort((a, b) => b.count - a.count);
        
        // Convert per-form maps to arrays for the per-form charts
        const formData = new Map<string, {formTitle: string, data: {name: string, count: number}[]}>();
        
        formRecipientCounts.forEach((counts, formId) => {
            if (counts.size > 0) {  // Only include forms with answers
                const chartData = Array.from(counts.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);
                    
                formData.set(formId, {
                    formTitle: formTitles.get(formId) || `Form ${formId}`,
                    data: chartData
                });
            }
        });
        
        setTotalChartData(totalData);
        setFormChartData(formData);
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6">回答分析</h1>
                <p>データを読み込み中です...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">回答分析</h1>
            
            {/* Total Chart */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">受任者別委任件数（全体）</h2>
                {totalChartData.length > 0 ? (
                    <div className="h-[400px] bg-white p-4 rounded-lg shadow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={totalChartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    type="number" 
                                    label={{ value: '委任件数', position: 'insideBottom', offset: -5 }} 
                                    allowDecimals={false} // 追加: 整数のみ表示
                                />
                                <YAxis 
                                    type="category"
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    width={80}
                                />
                                <Tooltip 
                                    formatter={(value) => [`${value}件`, '委任件数']}
                                    labelFormatter={(value) => `受任者: ${value}`}
                                />
                                <Legend />
                                <Bar dataKey="count" name="委任件数" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-gray-500">表示できるデータがありません。</p>
                )}
            </div>
            
            {/* Per-Form Charts */}
            <h2 className="text-xl font-semibold mb-4">フォーム別委任件数</h2>
            {Array.from(formChartData.entries()).length > 0 ? (
                <div className="space-y-8">
                    {Array.from(formChartData.entries()).map(([formId, { formTitle, data }]) => (
                        <div key={formId} className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium mb-3">{formTitle}</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            type="number"
                                            allowDecimals={false} // 追加: 整数のみ表示
                                        />
                                        <YAxis 
                                            type="category"
                                            dataKey="name" 
                                            tick={{ fontSize: 12 }}
                                            width={80}
                                        />
                                        <Tooltip 
                                            formatter={(value) => [`${value}件`, '委任件数']}
                                            labelFormatter={(value) => `受任者: ${value}`}
                                        />
                                        <Bar dataKey="count" name="委任件数" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">総委任件数: {data.reduce((acc, item) => acc + item.count, 0)}件</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">表示できるデータがありません。</p>
            )}

            <div className="mt-8 mb-6">
                <h3 className="text-lg font-semibold mb-2">集計情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 mb-1">総フォーム数</p>
                        <p className="text-2xl font-bold">{forms.filter(form => form.open).length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 mb-1">総回答数</p>
                        <p className="text-2xl font-bold">{answers.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 mb-1">受任者数</p>
                        <p className="text-2xl font-bold">{totalChartData.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnswerAnalysis;
