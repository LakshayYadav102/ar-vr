import axios from "axios";

export async function fetchEcoInfo(objectName) {
  try {
    const res = await axios.post("http://localhost:8000/eco-info", {
      object_name: objectName,
    });

    const data = res.data;

    // Map qualitative carbon impact to numeric values (if backend returns strings)
    let carbonValue = data.carbon;
    if (typeof carbonValue === "string") {
      const impactMap = {
        "Low impact": 2,
        "Moderate impact": 5,
        "High impact": 10,
      };
      carbonValue = impactMap[data.carbon.toLowerCase()] || 5; // Default to 5 if unmapped
    } else if (!carbonValue) {
      carbonValue = Math.floor(Math.random() * 10) + 1; // Fallback random value
    }

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
      carbon: carbonValue, // Ensure numeric carbon value
      videos,
    };

  } catch (err) {
    console.error("Error fetching eco info:", err);

    const videoLink = `https://www.youtube.com/results?search_query=how+to+recycle+${encodeURIComponent(objectName)}`;
    const fallbackCarbon = Math.floor(Math.random() * 10) + 1; // Fallback numeric value

    return {
      recyclable: "Unknown",
      carbon: fallbackCarbon,
      alternative: "Unknown",
      summary: "No data available.",
      videos: [{ title: `How to recycle ${objectName}`, link: videoLink }],
      links: [],
    };
  }
}