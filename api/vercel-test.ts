import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    success: true,
    message: 'Vercel function is working',
    timestamp: new Date().toISOString(),
    productsCount: 193
  });
}