

const API_KEY = "AIzaSyCCftkm8K7ONkvKIyCmU3cdCazBG3iw7fY";


const CHANNELS = [
  { name: "Vox", id: "UCLXo7UDZvByw2ixzpQCufnA" },
  { name: "Vice News", id: "UCn8zNIfYAQNdrFRrr8oibKw" },
  { name: "Diary of a CEO", id: "UCGq-a57w-aPwyi3pW7XLiHw" },
  { name: "The Mel Robbins Podcast", id: "UCk2U-Oqn7RXf-ydPqfSxG5g" },
  {name:"The Ezra Klein Show", id: "UCnxuOd8obvLLtf5_-YKFbiQ"},
  {name:"The Associated Press", id: "UC52X5wxOL_s5yw0dQk7NtgA"},
  {name:"PBS Newshour", id: "UC6ZFN9Tx6xh-skXCuRHCDpQ"}
];

export default async function handler(req) {
  try {
    const allVideos = [];

    for (const channel of CHANNELS) {
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channel.id}&key=${API_KEY}`
      );
      const channelData = await channelRes.json();
      const playlistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!playlistId) {
        console.log(`🚫 No uploads playlist found for ${channel.name}`);
        continue;
      }

      const playlistRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=${playlistId}&key=${API_KEY}`
      );
      const playlistData = await playlistRes.json();

      const videoItems = playlistData.items || [];

      const videoIds = videoItems
        .map((item) => item.snippet?.resourceId?.videoId)
        .filter(Boolean);

      if (videoIds.length === 0) continue;

      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status,snippet&id=${videoIds.join(",")}&key=${API_KEY}`
      );
      const detailsData = await detailsRes.json();

      const videos = detailsData.items
        .filter((item) => {
          const match = item.contentDetails.duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
          const minutes = parseInt(match?.[1] || "0", 10);
          const seconds = parseInt(match?.[2] || "0", 10);
          const totalSeconds = minutes * 60 + seconds;
  
          const isEmbeddable = item.status?.embeddable;
          const aspectRatio =
            (item.snippet.thumbnails?.medium?.width || 1) /
            (item.snippet.thumbnails?.medium?.height || 1);

          const title = item.snippet.title.toLowerCase();
          const isLikelyShort = title.includes("shorts") || aspectRatio < 1;

          const filteredOut =
          !isEmbeddable || isLikelyShort;

          return !filteredOut;
        })
        .map((item) => ({
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channel: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id}`,
        }));
        

      console.log(`✅ Pulled ${videos.length} videos from ${channel.name}`);
      allVideos.push(...videos);
    }

    return new Response(JSON.stringify(allVideos.sort(() => Math.random() - 0.5)), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("❌ YouTube API error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch videos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
