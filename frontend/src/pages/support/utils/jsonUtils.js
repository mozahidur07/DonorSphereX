/**
 * Safely extracts a proper JSON response from potential malformed JSON responses
 * This is particularly useful for handling responses from fallback APIs that
 * may not format JSON correctly
 * 
 * @param {string} text - The text response to parse
 * @returns {Object} - Parsed response with answer and suggested questions
 */
export function safeParseAIResponse(text) {
  try {
    // First try normal JSON parsing
    return JSON.parse(text);
  } catch (e) {
    console.log("Failed to parse response as JSON, trying to extract JSON:", e);
    
    try {
      // Find anything that looks like a JSON object with our expected structure
      const jsonMatch = text.match(/\{[\s\S]*"answer"[\s\S]*"suggestedQuestions"[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e2) {
      console.log("Failed to extract JSON using regex:", e2);
    }
    
    // Extract the main content from the text response
    const cleanText = text
      .replace(/^```json/i, '')
      .replace(/```$/i, '')
      .trim();
      
    try {
      return JSON.parse(cleanText);
    } catch (e3) {
      console.log("Failed to parse cleaned JSON:", e3);
      
      // Last resort: Create a valid JSON response from the text
      return {
        answer: text.substring(0, 1500), // Limit to avoid massive responses
        suggestedQuestions: [
          "How can I donate blood?",
          "What are the eligibility requirements?",
          "How do I request blood?"
        ]
      };
    }
  }
}
