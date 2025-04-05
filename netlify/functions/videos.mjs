

const API_KEY = process.env.YT_API_KEY;


const CHANNELS = [
  {name:"Vox", id:"UCLXo7UDZvByw2ixzpQCufnA"},
  {name:"The Wall Street Journal", id:"UCK7tptUDHh-RYDsdxO1-5QQ"},
  {name:"Bloomberg Originals", id:"UCUMZ7gohGI9HcU9VNsr2FJQ"},
  {name:"Vice", id:"UCn8zNIfYAQNdrFRrr8oibKw"},
  {name:"Business Insider", id:"UCcyq283he07B7_KUX07mmtA"},
  {name: "CBS Sunday Morning", id: "UCVT1tPkR-fUVlO652EcO3ow"}
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

          const underThreeMins = totalSeconds < 181;

          const title = item.snippet.title.toLowerCase();
          const isLikelyShort = title.includes("shorts") || aspectRatio < 1;

          const filteredOut =
          !isEmbeddable || isLikelyShort || underThreeMins;

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
      
      allVideos.push(...videos);
    }

    return new Response(JSON.stringify(allVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))), {
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
