 
export function safeParseAIResponse(text) {
  try { 
    return JSON.parse(text);
  } catch (e) { 
    
    try { 
      const jsonMatch = text.match(/\{[\s\S]*"answer"[\s\S]*"suggestedQuestions"[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e2) { 
    }
     
    const cleanText = text
      .replace(/^```json/i, '')
      .replace(/```$/i, '')
      .trim();
      
    try {
      return JSON.parse(cleanText);
    } catch (e3) { 
       
      return {
        answer: text.substring(0, 1500), 
        suggestedQuestions: [
          "How can I donate blood?",
          "What are the eligibility requirements?",
          "How do I request blood?"
        ]
      };
    }
  }
}
