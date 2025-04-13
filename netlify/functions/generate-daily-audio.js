const fs = require('fs');
const path = require('path');
const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async function () {
const cheerio = require('cheerio');
const unfluff = require('unfluff');

async function getFullArticleText(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Moodscroll bot)',
      },
    });

    const parsed = unfluff(res.data);
    const cleanText = parsed.text?.trim();

    // Limit to 2000 characters max to keep GPT prompt size manageable
    return cleanText ? cleanText.slice(0, 2000) : null;
  } catch (err) {
    console.error("❌ Failed to fetch full article:", err.message);
    return null;
  }
}

  try {
    async function getSummaryFromFunction(url) {
      const res = await axios.get(`http://localhost:8888/.netlify/functions/${url}`);
      const data = res.data;
    
      if (!Array.isArray(data) || data.length === 0) return "No story available.";
    
      const top = data[0];
    
      if (url === 'podcast') {
        return `${top.title}: ${top.description}`;
      }
      
      if (url === 'fetchTopStories') {
        const fullText = await getFullArticleText(top.link);
        return fullText || `${top.title}: ${top.summary || top.description || top.excerpt || ""}`;
      }
      
      return `${top.title}: ${top.summary || top.description || top.excerpt || ""}`};
      
    const focusedSummary = await getSummaryFromFunction('fetchTopStories');
    const mellowSummary = await getSummaryFromFunction('goodnewsnetwork');
    const tunedInSummary = await getSummaryFromFunction('podcast?feed=thedaily');

    // === PROMPT TO GPT-4 ===
    const gptPrompt = `
    You are the narrator of a short audio segment called "Moodscroll Daily Recap."
    Format:
    Intro (warm welcome)
    Focused: ${focusedSummary}
    Mellow: ${mellowSummary}
    Tuned In: ${tunedInSummary}
    Outro (kind signoff)

    Rules:
    - Use only the information provided. Do not speculate or add extra context (e.g. current or former titles, dates, numbers) unless it is explicitly in the summaries.
    - Mention the name of the news or podcast source if available, but do not include links.
    - End each section with a light nudge like "You can read more on Moodscroll" or "That full story is up now on Moodscroll."
    - Keep it casual, brief, and calm.
    - Target read time: 3–4 minutes.
    `;
    const chatResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: gptPrompt }],
      temperature: 0.7,
    });

    let script = chatResponse.choices[0].message.content;

    async function runFactCheck(scriptToCheck) {
      const factCheckPrompt = `
    You're an assistant fact-checking an AI-generated news script. Your job is to flag any potential factual inaccuracies, hallucinated names, titles, or dates that are not present in the provided summaries.
    
    Summaries:
    Focused: ${focusedSummary}
    Mellow: ${mellowSummary}
    Tuned In: ${tunedInSummary}
    
    Script:
    ${scriptToCheck}
    
    Instructions:
    - ONLY use the facts explicitly present in the summaries.
    - If the script adds any extra details (e.g. names, dates, calling Trump a 'former president'), flag it.
    - Return a short analysis: either "✅ No issues found" or a list of the questionable lines with explanations.
    `;
    
      const factCheckResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: factCheckPrompt }],
        temperature: 0.2,
      });
    
      return factCheckResponse.choices[0].message.content;
    }
    
    let factCheckResult = await runFactCheck(script);
    
    // Auto-regenerate once if fact-check fails
    if (!factCheckResult.includes("✅ No issues found")) {
      console.warn("⚠️ Fact check failed. Regenerating script...");
    
      const secondResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: gptPrompt }],
        temperature: 0.7,
      });
    
      const secondScript = secondResponse.choices[0].message.content;
      const secondFactCheck = await runFactCheck(secondScript);
    
      if (secondFactCheck.includes("✅ No issues found")) {
        script = secondScript;
        factCheckResult = secondFactCheck;
      } else {
        console.warn("⚠️ Second script still contains issues.");
        // Keep original script but return both reports
        factCheckResult += "\n⚠️ Regenerated script also flagged. Manual review suggested.";
      }
    }
    

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
      body: JSON.stringify({
        message: '✅ Audio generated!',
        script,
        factCheckResult
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: `Error: ${error.message}`,
    };
  }
};
