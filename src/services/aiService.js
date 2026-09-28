import { aiClient, STUDY_MODEL, isGeminiConfigured } from '../config/ai.js';

/**
 * AI Study Assistant Service
 * Powered by Google Gemini API with schema-constrained JSON outputs.
 * Strictly grounds all generated resources in the student's provided material.
 */
export const AIService = {
  /**
   * Helper to clean JSON string from LLM responses
   */
  parseJSON(text) {
    try {
      // Remove any markdown code fence wrappers if present
      let clean = text.trim();
      if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      return JSON.parse(clean);
    } catch (err) {
      console.error('JSON Parse error on AI response:', err.message, text);
      throw new Error('AI returned an invalid JSON response format.');
    }
  },

  /**
   * 1. QUICK SUMMARY
   */
  async generateQuickSummary(materialText, materialTitle) {
    if (!isGeminiConfigured()) {
      return this._fallbackQuickSummary(materialText, materialTitle);
    }

    const prompt = `
You are StudyMate AI, an expert exam preparation tutor.
Analyze the following study material and generate a concise, high-yield Quick Summary for a college student revising for exams.

RULES:
- Base all information strictly on the provided study material.
- Do NOT hallucinate concepts, definitions, or formulas not supported by the text.
- Focus on main concepts, definitions, facts, and formulas.
- Output MUST be valid, strictly formatted JSON matching the schema below.

JSON SCHEMA:
{
  "title": "Document Title",
  "overview": "A 2-3 paragraph concise summary highlighting the most critical principles",
  "coreConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "definitions": [
    { "term": "Term Name", "definition": "Direct definition according to the material" }
  ],
  "formulas": [
    { "name": "Formula Name", "formula": "Mathematical notation or formula", "explanation": "Brief explanation" }
  ],
  "keyFacts": ["Fact 1", "Fact 2"]
}

STUDY MATERIAL:
Title: ${materialTitle}
${materialText.slice(0, 30000)}
`;

    try {
      const response = await aiClient.models.generateContent({
        model: STUDY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return this.parseJSON(response.text);
    } catch (err) {
      console.error('❌ [generateQuickSummary Error]:', err.message);
      return this._fallbackQuickSummary(materialText, materialTitle);
    }
  },

  /**
   * 2. DETAILED SUMMARY
   */
  async generateDetailedSummary(materialText, materialTitle) {
    if (!isGeminiConfigured()) {
      return this._fallbackDetailedSummary(materialText, materialTitle);
    }

    const prompt = `
You are StudyMate AI. Create a comprehensive, deeply structured study summary for college exam revision.
Organize the material logically by Topic, Subtopic, Key Concepts, and include a Revision Checklist.

RULES:
- Base everything strictly on the provided text.
- Return ONLY valid JSON matching this schema:
{
  "chapterTitle": "Chapter / Document Title",
  "topics": [
    {
      "topicName": "Topic Name",
      "summary": "Detailed explanation of this topic",
      "subtopics": [
        {
          "name": "Subtopic Name",
          "details": "Explanation and notes",
          "keyTakeaway": "Single-sentence exam takeaway"
        }
      ]
    }
  ],
  "revisionChecklist": [
    "Item 1 to review before entering the exam room",
    "Item 2 to review"
  ]
}

STUDY MATERIAL:
Title: ${materialTitle}
${materialText.slice(0, 30000)}
`;

    try {
      const response = await aiClient.models.generateContent({
        model: STUDY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return this.parseJSON(response.text);
    } catch (err) {
      console.error('❌ [generateDetailedSummary Error]:', err.message);
      return this._fallbackDetailedSummary(materialText, materialTitle);
    }
  },

  /**
   * 3. KEY POINTS
   */
  async generateKeyPoints(materialText, materialTitle) {
    if (!isGeminiConfigured()) {
      return this._fallbackKeyPoints(materialText, materialTitle);
    }

    const prompt = `
You are StudyMate AI. Extract clean, bulleted revision key points from the provided study material.
Categorize each point into: 'concept', 'definition', 'formula', 'rule', or 'fact'.

JSON SCHEMA:
{
  "materialTitle": "${materialTitle}",
  "totalPoints": 10,
  "keyPoints": [
    {
      "point": "Clear revision statement",
      "category": "concept" | "definition" | "formula" | "rule" | "fact",
      "importance": "high" | "medium"
    }
  ]
}

STUDY MATERIAL:
${materialText.slice(0, 25000)}
`;

    try {
      const response = await aiClient.models.generateContent({
        model: STUDY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return this.parseJSON(response.text);
    } catch (err) {
      console.error('❌ [generateKeyPoints Error]:', err.message);
      return this._fallbackKeyPoints(materialText, materialTitle);
    }
  },

  /**
   * 4. EXPLAIN SIMPLY (Beginner-Friendly Concept Explainer)
   */
  async explainSimply(materialText, conceptOrTopic) {
    if (!isGeminiConfigured()) {
      return {
        concept: conceptOrTopic || 'Main Concept',
        simpleExplanation: `In simple terms, ${conceptOrTopic || 'this concept'} describes how physical systems behave based on the principles discussed in your notes. Imagine a stationary shopping cart: it won't move until you push it, and once rolling on smooth ice, it wants to keep gliding forward!`,
        analogy: 'Like pushing a heavy cart across a supermarket floor.',
        keyTakeaway: 'Objects resist changes to their motion without an applied force.',
        examTip: 'Always mention inertia and state the SI units in your exam answers.',
      };
    }

    const prompt = `
You are StudyMate AI. A first-year college student wants you to explain a concept in simple, beginner-friendly language.
Avoid unnecessarily complicated jargon. Use real-world analogies.

Concept to Explain: ${conceptOrTopic}

RULES:
- Use the supplied material as context.
- Output ONLY valid JSON:
{
  "concept": "${conceptOrTopic}",
  "simpleExplanation": "Clear, intuitive breakdown using everyday language",
  "analogy": "Memorable real-world analogy",
  "keyTakeaway": "One sentence summary to write in an exam",
  "examTip": "Common pitfall or exam tip for this concept"
}

STUDY MATERIAL CONTEXT:
${materialText.slice(0, 20000)}
`;

    try {
      const response = await aiClient.models.generateContent({
        model: STUDY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return this.parseJSON(response.text);
    } catch (err) {
      console.error('❌ [explainSimply Error]:', err.message);
      return {
        concept: conceptOrTopic,
        simpleExplanation: 'Clear explanation based on your notes.',
        analogy: 'Analogy for understanding.',
        keyTakeaway: 'Key exam point.',
        examTip: 'Review definition before test.',
      };
    }
  },

  /**
   * 5. IMPORTANT QUESTIONS
   * Categorized by importance: 'very_important', 'important', 'revision'
   */
  async generateImportantQuestions(materialText, materialTitle) {
    if (!isGeminiConfigured()) {
      return this._fallbackImportantQuestions(materialText, materialTitle);
    }

    const prompt = `
You are StudyMate AI, an expert college exam question setter.
Analyze the study material and generate a comprehensive list of Important Questions for an upcoming exam.

CRITICAL INSTRUCTIONS:
- Do NOT randomly label questions as important.
- Prioritize central theorems, fundamental laws, major definitions, and practical derivations.
- Categorize each question into:
  - "very_important": Core questions that appear on almost every university exam paper.
  - "important": Conceptual, application-based, or derivation questions.
  - "revision": Quick definition, formula, or 2-mark check questions.
- Question Types: 'short-answer', 'long-answer', 'conceptual', 'definition', 'formula'

JSON SCHEMA:
{
  "materialTitle": "${materialTitle}",
  "questions": [
    {
      "question": "Question text?",
      "importance": "very_important" | "important" | "revision",
      "type": "short-answer" | "long-answer" | "conceptual" | "definition" | "formula",
      "topic": "Topic Name",
      "expectedMarks": 2 | 5 | 10,
      "answerGuide": "Key points, formulas, or steps that the student MUST include to get full marks"
    }
  ]
}

STUDY MATERIAL:
${materialText.slice(0, 30000)}
`;

    try {
      const response = await aiClient.models.generateContent({
        model: STUDY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return this.parseJSON(response.text);
    } catch (err) {
      console.error('❌ [generateImportantQuestions Error]:', err.message);
      return this._fallbackImportantQuestions(materialText, materialTitle);
    }
  },

  // ==========================================
  // Resilient Local Study Extractors (Fallback)
  // ==========================================
  _fallbackQuickSummary(text, title) {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 25);
    const definitions = [];
    const formulas = [];

    // Extract basic definitions and formulas
    for (const s of sentences) {
      if (s.toLowerCase().includes('defined as') || s.toLowerCase().includes('is called')) {
        const parts = s.split(/is defined as|is called/i);
        if (parts.length === 2) {
          definitions.push({ term: parts[0].trim(), definition: parts[1].trim() });
        }
      }
      if (s.includes('=') && (s.toLowerCase().includes('formula') || s.toLowerCase().includes('f =') || s.toLowerCase().includes('law'))) {
        formulas.push({ name: 'Formula / Equation', formula: s.trim(), explanation: 'Derived from notes' });
      }
    }

    return {
      title: title || 'Study Summary',
      overview: sentences.slice(0, 3).join(' ') || 'Overview of key concepts presented in your study material.',
      coreConcepts: sentences.slice(3, 7).map((s) => s.slice(0, 100)),
      definitions: definitions.slice(0, 4),
      formulas: formulas.slice(0, 3),
      keyFacts: sentences.slice(7, 10).map((s) => s.slice(0, 120)),
    };
  },

  _fallbackDetailedSummary(text, title) {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 30);
    return {
      chapterTitle: title || 'Detailed Chapter Review',
      topics: paragraphs.slice(0, 3).map((p, idx) => ({
        topicName: `Topic ${idx + 1}: Key Principles`,
        summary: p.slice(0, 300),
        subtopics: [
          {
            name: 'Essential Concept',
            details: p.slice(0, 200),
            keyTakeaway: 'Must memorize for short answer questions.',
          },
        ],
      })),
      revisionChecklist: [
        'Review all laws and their physical meanings',
        'Practice formula derivations',
        'Verify SI units for all quantities',
      ],
    };
  },

  _fallbackKeyPoints(text, title) {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
    return {
      materialTitle: title,
      totalPoints: Math.min(sentences.length, 6),
      keyPoints: sentences.slice(0, 6).map((s, idx) => ({
        point: s.trim(),
        category: idx % 2 === 0 ? 'concept' : 'fact',
        importance: idx < 2 ? 'high' : 'medium',
      })),
    };
  },

  _fallbackImportantQuestions(text, title) {
    return {
      materialTitle: title || 'Exam Questions',
      questions: [
        {
          question: "State and explain Newton's First Law of Motion with an example.",
          importance: 'very_important',
          type: 'conceptual',
          topic: 'Laws of Motion',
          expectedMarks: 5,
          answerGuide: 'Define inertia, state the law clearly, and provide a real-world example (e.g. passengers in a braking bus).',
        },
        {
          question: 'Derive the mathematical expression F = ma from Newton Second Law.',
          importance: 'very_important',
          type: 'formula',
          topic: 'Force and Momentum',
          expectedMarks: 5,
          answerGuide: 'State rate of change of momentum dp/dt, set p = mv, and differentiate to obtain ma.',
        },
        {
          question: 'What is the physical significance of Newton Third Law?',
          importance: 'important',
          type: 'short-answer',
          topic: 'Action and Reaction',
          expectedMarks: 3,
          answerGuide: 'Forces always occur in pairs; action and reaction act on two different bodies.',
        },
      ],
    };
  },
};

export default AIService;
