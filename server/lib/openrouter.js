// OpenRouter AI Integration Module for StarReview AI
// Secure, server-side API calls for Review Drafts & Sentiment-Aware Replies

import { localDrafts, localReply } from './drafts.js';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export function isOpenRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim());
}

/**
 * Generate 3 human-like review drafts using OpenRouter AI
 */
export async function generateOpenRouterDrafts({ business, experience, staff, keywords, language, rating }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

  if (!apiKey) {
    // Graceful fallback to verified multilingual template generator
    return localDrafts(business, experience, staff, keywords, language, rating);
  }

  // Sanitize inputs against prompt injection
  const safeBusiness = String(business || 'the business').slice(0, 100).replace(/[^\w\s.,'-]/g, '');
  const safeExp = String(experience || 'great service').slice(0, 200).replace(/[^\w\s.,'-]/g, '');
  const safeStaff = String(staff || '').slice(0, 80).replace(/[^\w\s.,'-]/g, '');
  const safeKw = String(keywords || '').slice(0, 100).replace(/[^\w\s.,'-]/g, '');
  const safeLang = String(language || 'English').slice(0, 40);
  const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));

  const systemPrompt = `You are an expert review assistant for genuine customers leaving a ${safeRating}-star review for a local business on Google.
Write exactly three distinct, natural, and helpful review draft suggestions from the customer's perspective.
Rules:
- Write in ${safeLang}.
- Each draft should feel natural, authentic, and human (not robotic or promotional).
- Keep length between 25 and 65 words per draft.
- Mention real details if provided: Experience ("${safeExp}"), Staff member ("${safeStaff}"), Keywords ("${safeKw}").
- Output ONLY valid JSON in this exact format: {"drafts": ["draft 1 text", "draft 2 text", "draft 3 text"]}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://starreview-ai-alpha.vercel.app',
        'X-Title': 'StarReview AI Platform'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please provide 3 review drafts for ${safeBusiness}.` }
        ],
        temperature: 0.7,
        max_tokens: 450,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[OpenRouter] API returned ${response.status}. Using local engine.`);
      return localDrafts(business, experience, staff, keywords, language, rating);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (rawContent) {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed.drafts) && parsed.drafts.length >= 3) {
        return parsed.drafts.slice(0, 3);
      }
    }
  } catch (err) {
    console.warn('[OpenRouter] Call error or timeout, falling back:', err.message);
  }

  return localDrafts(business, experience, staff, keywords, language, rating);
}

/**
 * Generate a professional, sentiment-aware reply to a Google review
 */
export async function generateOpenRouterReply({ businessName, reviewText, reviewerName, rating, tone }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

  if (!apiKey) {
    return localReply(businessName, reviewText, reviewerName, rating, tone);
  }

  const safeBiz = String(businessName || 'our business').slice(0, 100);
  const safeReview = String(reviewText || '').slice(0, 400);
  const safeReviewer = String(reviewerName || 'Customer').slice(0, 60);
  const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const safeTone = String(tone || 'warm, professional, and appreciative').slice(0, 60);

  const prompt = `You are writing an official owner response to a Google review on behalf of ${safeBiz}.
Review details:
- Reviewer: ${safeReviewer}
- Star Rating: ${safeRating}/5
- Review Content: "${safeReview}"
- Desired Tone: ${safeTone}

Instructions:
- Write a professional, polite, 2 to 4 sentence response.
- Thank them genuinely.
- If negative (1-3 stars), acknowledge politely and offer a path to resolve privately via support.
- Return ONLY the reply text, no quotes or explanations.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://starreview-ai-alpha.vercel.app',
        'X-Title': 'StarReview AI Platform'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 250
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();
      if (reply) return reply;
    }
  } catch (err) {
    console.warn('[OpenRouter] Reply generation error, falling back:', err.message);
  }

  return localReply(businessName, reviewText, reviewerName, rating, tone);
}
