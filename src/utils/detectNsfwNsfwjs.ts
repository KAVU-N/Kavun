// NSFWJS ile istemci tarafında +18 (NSFW) görsel tespiti
// İlk kullanımda model yüklenir ve sonraki analizler hızlı olur
import * as nsfwjs from 'nsfwjs';
let nsfwModel: nsfwjs.NSFWJS | null = null;

export async function detectNsfwWithNsfwjs(imgElement: HTMLImageElement): Promise<boolean> {
  if (!nsfwModel) {
    nsfwModel = await nsfwjs.load();
  }
  const predictions = await nsfwModel.classify(imgElement);
  // Porn, Hentai, Sexy oranı %15 üzerindeyse uygunsuz kabul et
  return predictions.some(pred =>
    (pred.className === 'Porn' || pred.className === 'Hentai' || pred.className === 'Sexy') && pred.probability > 0.15
  );
}
