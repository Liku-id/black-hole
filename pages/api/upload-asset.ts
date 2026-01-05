import type { NextApiRequest, NextApiResponse } from 'next/types';

import { apiRouteUtils } from '@/utils/apiRouteUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { type, file, filename, privacy, fileGroup } = req.body;

    if (!type || !file || !filename || !privacy || !fileGroup) {
      return res.status(400).json({
        code: 400,
        message: 'All fields are required',
        details: []
      });
    }

    // Use apiRouteUtils
    const postHandler = apiRouteUtils.createPostHandler({
      endpoint: '/upload-asset',
      timeout: 60000 // Longer timeout for file uploads
    });

    return await postHandler(req, res);
  } catch (error) {
    console.error('Upload asset API error:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error',
      details: []
    });
  }
}
