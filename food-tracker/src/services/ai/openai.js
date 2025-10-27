import axios from 'axios';

const openai = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
  },
});

export const getOpenAIResponse = async (prompt) => {
  const response = await openai.post('/chat/completions', {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: prompt },
    ],
    response_format: { type: "json_object" }
  });
  return response.data;
};