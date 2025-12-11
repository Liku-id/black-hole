import type { NextApiRequest, NextApiResponse } from 'next/types';

import { encryptUtils } from '@/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Encrypt token using encryptUtils (uses PREVIEW_TOKEN_SECRET from env)
    const encryptedToken = encryptUtils.encrypt(token);

    return res.status(200).json({ encryptedToken });
  } catch (error) {
    console.error('Encryption error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

