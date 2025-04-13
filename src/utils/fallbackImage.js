// utils/fallbackImage.js
import sourceLogos from "./sourceLogos";

const fallbackImage = (story) => {
    if (story.image_url) return story.image_url;
  
    if (sourceLogos[story.sourceLabel]) {
      return sourceLogos[story.sourceLabel];
    }
  
    const keyword = story.title?.split(" ").slice(0, 3).join(" ") || "";
    const unsplash = `https://source.unsplash.com/600x400/?${encodeURIComponent(keyword)}`;
  
    // Add random string to avoid caching identical "no image" results
    return story.title ? unsplash : "/fallbacks/placeholder.png";
  };
  

export default fallbackImage;
