// Google Cloud Vision API ile +18 (adult) içerik tespiti
// API anahtarınızı .env dosyasına GCP_VISION_API_KEY olarak ekleyin

export async function detectAdultContent(base64Image: string): Promise<'LIKELY' | 'VERY_LIKELY' | 'POSSIBLE' | 'UNLIKELY' | 'VERY_UNLIKELY' | null> {
  const apiKey = process.env.NEXT_PUBLIC_GCP_VISION_API_KEY;
  if (!apiKey) {
    console.warn('Google Vision API anahtarı tanımlı değil.');
    return null;
  }
  const body = {
    requests: [
      {
        image: { content: base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '') },
        features: [
          { type: 'SAFE_SEARCH_DETECTION' }
        ]
      }
    ]
  };
  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  try {
    return data.responses[0].safeSearchAnnotation.adult || null;
  } catch {
    return null;
  }
}
