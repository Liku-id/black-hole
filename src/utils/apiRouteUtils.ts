import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next/types';

import { getSession, isAuthenticated } from '@/lib/sessionHelpers';

interface ApiRouteOptions {
  endpoint: string;
  timeout?: number;
  transformQuery?: (query: any) => any;
  requireAuth?: boolean;
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

        // Get tokens from session for authentication
        if (options.requireAuth !== false) {
          // Default to true
          const session = await getSession(req, res);
          if (isAuthenticated(session) && session.accessToken) {
            headers.Authorization = `Bearer ${session.accessToken}`;
          } else {
            return res.status(401).json({ message: 'Authentication required' });
          }
        }

        const response = await axios.get(url, {
          params,
          headers,
          timeout: options.timeout || 10000
        });

        return res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Check if it's an auth error and handle accordingly
          if (error.response.status === 401) {
            // Clear session on auth error
            try {
              const session = await getSession(req, res);
              session.destroy();
            } catch (sessionError) {
              console.error('Session clear error:', sessionError);
            }
          }
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

        // Get tokens from session for authentication
        if (options.requireAuth !== false) {
          // Default to true
          const session = await getSession(req, res);
          if (isAuthenticated(session) && session.accessToken) {
            headers.Authorization = `Bearer ${session.accessToken}`;
          } else {
            return res.status(401).json({ message: 'Authentication required' });
          }
        }

        const response = await axios.post(url, req.body, {
          headers,
          timeout: options.timeout || 30000
        });

        return res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Check if it's an auth error and handle accordingly
          if (error.response.status === 401) {
            // Clear session on auth error
            try {
              const session = await getSession(req, res);
              session.destroy();
            } catch (sessionError) {
              console.error('Session clear error:', sessionError);
            }
          }
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

        // Get tokens from session for authentication
        if (options.requireAuth !== false) {
          // Default to true
          const session = await getSession(req, res);
          if (isAuthenticated(session) && session.accessToken) {
            headers.Authorization = `Bearer ${session.accessToken}`;
          } else {
            return res.status(401).json({ message: 'Authentication required' });
          }
        }

        const response = await axios.put(url, req.body, {
          headers,
          timeout: options.timeout || 30000
        });

        return res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Check if it's an auth error and handle accordingly
          if (error.response.status === 401) {
            // Clear session on auth error
            try {
              const session = await getSession(req, res);
              session.destroy();
            } catch (sessionError) {
              console.error('Session clear error:', sessionError);
            }
          }
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

        // Get tokens from session for authentication
        if (options.requireAuth !== false) {
          // Default to true
          const session = await getSession(req, res);
          if (isAuthenticated(session) && session.accessToken) {
            headers.Authorization = `Bearer ${session.accessToken}`;
          } else {
            return res.status(401).json({ message: 'Authentication required' });
          }
        }

        const response = await axios.delete(url, {
          headers,
          params,
          timeout: options.timeout || 30000
        });

        return res.status(response.status).json(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Check if it's an auth error and handle accordingly
          if (error.response.status === 401) {
            // Clear session on auth error
            try {
              const session = await getSession(req, res);
              session.destroy();
            } catch (sessionError) {
              console.error('Session clear error:', sessionError);
            }
          }
          return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ message: 'Internal server error' });
      }
    };
  }
};
