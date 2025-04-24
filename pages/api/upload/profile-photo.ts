import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }
  // Not: Gerçek upload işlemi burada yapılmalı. Şimdilik base64'ü URL gibi döndürüyoruz.
  res.status(200).json({ url: image });
}
