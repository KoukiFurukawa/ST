/* Copyright (c) 2025 古川幸樹 */
/* このソースコードは自由に使用、複製、改変、再配布することができます。 */
/* ただし、著作権表示は削除しないでください。  */
export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  recipientName: string;
  recipientAddress: string;
  created_at: number;
  open: boolean;
}

export interface Answer {
  id: string; // Combined from userId#commissionID
  commissionID: string;
  userId: string;
  answer: string; // Assuming answer is a string, adjust if it's structured data
  created_at: number; // Or string, depending on how it comes from API and if conversion is needed
}