import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    success: true,
    message: 'Health check successful',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
}