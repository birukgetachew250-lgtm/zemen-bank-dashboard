'use server';
/**
 * @fileOverview Anomaly detection AI agent.
 *
 * - detectTransactionAnomaly - A function that handles the transaction anomaly detection process.
 * - DetectTransactionAnomalyInput - The input type for the detectTransactionAnomaly function.
 * - DetectTransactionAnomalyOutput - The return type for the detectTransactionAnomaly function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectTransactionAnomalyInputSchema = z.object({
  transactionData: z.string().describe('A JSON string containing transaction data, including customer ID, transaction amount, timestamp, and other relevant details.'),
});
export type DetectTransactionAnomalyInput = z.infer<typeof DetectTransactionAnomalyInputSchema>;

const DetectTransactionAnomalyOutputSchema = z.object({
  isAnomalous: z.boolean().describe('Whether or not the transaction is considered anomalous.'),
  anomalyReason: z.string().describe('The reason why the transaction is considered anomalous, if applicable.'),
  suggestedAction: z.string().describe('A suggested action to take based on the anomaly detection result (e.g., flag for review, contact customer).'),
});
export type DetectTransactionAnomalyOutput = z.infer<typeof DetectTransactionAnomalyOutputSchema>;

export async function detectTransactionAnomaly(input: DetectTransactionAnomalyInput): Promise<DetectTransactionAnomalyOutput> {
  return detectTransactionAnomalyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectTransactionAnomalyPrompt',
  input: {schema: DetectTransactionAnomalyInputSchema},
  output: {schema: DetectTransactionAnomalyOutputSchema},
  prompt: `You are an expert in fraud detection and anomaly analysis for financial transactions.

You are provided with transaction data in JSON format. Your task is to analyze the transaction and determine if it is anomalous based on various factors such as the transaction amount, time of day, customer's historical transaction patterns, and any other relevant information.

Transaction Data: {{{transactionData}}}

Based on your analysis, determine whether the transaction is anomalous and provide a reason for your determination. Also, suggest an action to take based on your analysis.

Consider these potential anomaly indicators:
- Unusual transaction amount for the customer
- Transaction occurring at an unusual time of day for the customer
- Significant deviation from the customer's historical transaction patterns
- Transaction originating from a new or unusual location
- Any other suspicious factors

Return the output in JSON format.
`,
});

const detectTransactionAnomalyFlow = ai.defineFlow(
  {
    name: 'detectTransactionAnomalyFlow',
    inputSchema: DetectTransactionAnomalyInputSchema,
    outputSchema: DetectTransactionAnomalyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
