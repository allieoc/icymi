const fs = require('fs');
const path = require('path');
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async function () {
  try {
    // === MOCK STORIES ===
    const focusedSummary = `Kilmar Abrego Garcia, a Maryland man deported by mistake, remains detained in a high-security prison in El Salvador. The U.S. government, under court order, is being pushed to return him — a troubling example of how immigration errors can have lasting human consequences.`;
    const mellowSummary = `Heard Island penguins are selling pebbles to support wildlife conservation after Trump’s bizarre new tariffs. The campaign is playful and adorable — and 100% of proceeds go to WWF Australia.`;
    const tunedInSummary = `Today, Explained dives into the return of watercooler TV. With shows like The Pitt and Severance sparking real-life convos, the episode explores why shared viewing is making a comeback.`;

    // === PROMPT TO GPT-4 ===
    const gptPrompt = `
You are the narrator of a short audio segment called "Moodscroll Daily Recap."
Format:
Intro (warm welcome)
Focused: ${focusedSummary}
Mellow: ${mellowSummary}
Tuned In: ${tunedInSummary}
Outro (kind signoff)
Keep it casual, brief, and calm. Target read time is 3–4 minutes. Don't mention links or sources.
`;

    const chatResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: gptPrompt }],
      temperature: 0.7,
    });

    const script = chatResponse.choices[0].message.content;

    // === GENERATE VOICE FROM TTS API ===
    const ttsResponse = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'shimmer',
      input: script,
    });

    // === WRITE TO /public/audio/moodscroll-daily.mp3 ===
    const filePath = path.join(__dirname, '../../public/audio/moodscroll-daily.mp3');
    const writer = fs.createWriteStream(filePath);
    ttsResponse.body.pipe(writer);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '✅ Audio generated!', script }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`,
    };
  }
};
