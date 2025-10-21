import axios from "axios";

export async function fetchEcoInfo(objectName) {
  try {
    const res = await axios.post("http://localhost:8000/eco-info", {
      object_name: objectName,
    });

    const data = res.data;

    // Always provide a YouTube link for recycling the object
    const videoLink = `https://www.youtube.com/results?search_query=how+to+recycle+${encodeURIComponent(objectName)}`;

    // If OpenRouter provides videos, keep them; otherwise, use our generated link
    const videos = data.videos && data.videos.length > 0 
      ? data.videos.map((v, i) => 
          typeof v === "string"
            ? { title: `How to recycle ${objectName}`, link: v }
            : v
        )
      : [{ title: `How to recycle ${objectName}`, link: videoLink }];

    return {
      ...data,
      videos,
    };

  } catch (err) {
    console.error("Error fetching eco info:", err);

    const videoLink = `https://www.youtube.com/results?search_query=how+to+recycle+${encodeURIComponent(objectName)}`;

    return {
      recyclable: "Unknown",
      carbon: "Unknown",
      alternative: "Unknown",
      summary: "No data available.",
      videos: [{ title: `How to recycle ${objectName}`, link: videoLink }],
      links: [],
    };
  }
}
