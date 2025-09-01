import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next/types';

interface ApiRouteOptions {
  endpoint: string;
  timeout?: number;
}

export const apiRouteUtils = {
  createGetHandler: (options: ApiRouteOptions) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      try {
        const url = `${process.env.BACKEND_URL}${options.endpoint}`;
        const response = await axios.get(url, {
          timeout: options.timeout || 10000
        });

        return res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ message: 'Internal server error' });
      }
    };
  },

  createPostHandler: (options: ApiRouteOptions) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      try {
        const url = `${process.env.BACKEND_URL}${options.endpoint}`;
        const response = await axios.post(url, req.body, {
          timeout: options.timeout || 30000
        });

        return res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ message: 'Internal server error' });
      }
    };
  }
};
