// Import dependencies
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

// Initialize app and middleware
const app = express();
app.use(cors());
app.use(express.json());

// Set up OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Set up API endpoints
app.get('/', (req, res) => {
  res.status(200).send('Hello, world!');
});

app.post('/', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `${prompt}`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    const botResponse = response.data.choices[0].text;
    res.status(200).send({ bot: botResponse });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: error.message });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});
