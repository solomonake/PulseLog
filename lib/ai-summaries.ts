import OpenAI from 'openai'
import { Insight } from './types'

/**
 * AI SUMMARY FUNCTIONALITY
 * 
 * STRICT CONSTRAINTS:
 * - AI only converts precomputed facts into clear explanations
 * - AI never invents advice or predictions
 * - AI never escalates severity
 * - If data is insufficient, output factual restatement only
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate weekly summary from validated insights
 * Only summarizes facts that have already been determined by the decision system
 */
export async function generateWeeklySummary(insights: Insight[]): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  if (insights.length === 0) {
    return null
  }

  try {
    // Prepare factual data only
    const facts = insights.map(insight => ({
      type: insight.type,
      severity: insight.severity,
      explanation: insight.explanation,
      raw_data: insight.raw_data,
      confidence: insight.confidence,
    }))

    const prompt = `You are a collegiate distance coach reviewing a training log. Convert the following factual insights into a clear, coach-like weekly summary.

CRITICAL RULES:
- Only restate the facts provided. Do not invent advice.
- Do not predict injuries or outcomes.
- Do not escalate severity beyond what is stated.
- Use the tone of a post-practice training log review.
- Be direct and factual, not motivational.

Facts to summarize:
${JSON.stringify(facts, null, 2)}

Generate a 2-3 sentence summary that restates these facts in a coach-like tone. If the data is insufficient, simply state what is known factually.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a collegiate distance coach. You only restate facts. You never invent advice or predictions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Low temperature for factual output
      max_tokens: 200,
    })

    return response.choices[0]?.message?.content || null
  } catch (error) {
    console.error('AI summary error:', error)
    return null
  }
}

/**
 * Enhance insight explanation with AI (only if explanation is too technical)
 * This is optional and only used to improve clarity, not to change meaning
 */
export async function enhanceInsightExplanation(
  insight: Insight,
  context: { logsCount: number; daysOfData: number }
): Promise<string> {
  // If we have sufficient data and a clear explanation, return as-is
  if (insight.confidence === 'high' && insight.explanation.length > 20) {
    return insight.explanation
  }

  if (!process.env.OPENAI_API_KEY) {
    return insight.explanation
  }

  try {
    const prompt = `Convert this factual training insight into a clear, coach-like explanation. Do not change the meaning, severity, or add advice.

Original: ${insight.explanation}
Raw data: ${JSON.stringify(insight.raw_data)}
Confidence: ${insight.confidence}
Data context: ${context.logsCount} logs over ${context.daysOfData} days

Generate a single sentence that restates this fact more clearly. Do not add predictions or advice.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a collegiate distance coach. You only restate facts more clearly. You never change meaning or add advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 100,
    })

    const enhanced = response.choices[0]?.message?.content
    return enhanced || insight.explanation
  } catch (error) {
    console.error('AI enhancement error:', error)
    return insight.explanation
  }
}

