// Fetch Wikipedia summary
export async function fetchWikipediaSummary(objectName) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(objectName)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.extract || "No Wikipedia summary found.";
  } catch (err) {
    console.error(err);
    return "Error fetching Wikipedia summary.";
  }
}

// Fetch YouTube videos
export async function fetchYouTubeVideos(objectName) {
  const API_KEY = "YOUR_YOUTUBE_API_KEY"; // replace with your key
  const query = encodeURIComponent(objectName + " recycling eco-friendly");
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=3&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.items.map(item => ({
      title: item.snippet.title,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}
