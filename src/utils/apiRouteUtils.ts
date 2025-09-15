import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next/types';

interface ApiRouteOptions {
  endpoint: string;
  timeout?: number;
  transformQuery?: (query: any) => any;
}

export const apiRouteUtils = {
  createGetHandler: (options: ApiRouteOptions) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      try {
        const url = `${process.env.BACKEND_URL}${options.endpoint}`;
        const params = options.transformQuery
          ? options.transformQuery(req.query)
          : req.query;

        // Forward headers from request to backend
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        };

        // Forward Authorization header if present
        if (req.headers.authorization) {
          headers.Authorization = req.headers.authorization;
        }

        const response = await axios.get(url, {
          params,
          headers,
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

        // Forward headers from request to backend
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        };

        // Forward Authorization header if present
        if (req.headers.authorization) {
          headers.Authorization = req.headers.authorization;
        }

        const response = await axios.post(url, req.body, {
          headers,
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
  },

  createPutHandler: (options: ApiRouteOptions) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      try {
        const url = `${process.env.BACKEND_URL}${options.endpoint}`;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        };

        if (req.headers.authorization) {
          headers.Authorization = req.headers.authorization;
        }

        const response = await axios.put(url, req.body, {
          headers,
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
  },

  createDeleteHandler: (options: ApiRouteOptions) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      try {
        const url = `${process.env.BACKEND_URL}${options.endpoint}`;
        const params = options.transformQuery
          ? options.transformQuery(req.query)
          : req.query;

        // Forward headers from request to backend
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        };

        // Forward Authorization header if present
        if (req.headers.authorization) {
          headers.Authorization = req.headers.authorization;
        }

        const response = await axios.delete(url, {
          headers,
          params,
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
