import { apiRouteUtils } from '@/utils/apiRouteUtils';
import type { NextApiRequest, NextApiResponse } from 'next/types';

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

    // Security Check: Block SVG uploads to prevent Stored XSS
    const isSvg =
      filename.toLowerCase().endsWith('.svg') ||
      type === 'image/svg+xml' ||
      (typeof file === 'string' && file.includes('image/svg+xml'));

    if (isSvg) {
      return res.status(400).json({
        code: 400,
        message: 'SVG files are not allowed for security reasons.',
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
