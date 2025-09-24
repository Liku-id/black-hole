import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next/types';

import {
  clearSessionData,
  getSession,
  isAuthenticated,
  setSessionData
} from '@/lib/sessionHelpers';
import { ALLOWED_ROLES } from '@/types/auth';

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
  },

  createLoginHandler: (options: ApiRouteOptions) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      try {
        const url = `${process.env.BACKEND_URL}${options.endpoint}`;

        const response = await axios.post(url, req.body, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          timeout: options.timeout || 30000
        });

        // Get the session and store tokens securely
        const session = await getSession(req, res);

        // Check user role authorization
        const userRole = response.data.body.user?.role;
        if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
          return res.status(403).json({
            message:
              'Access denied. Your role is not authorized to access this platform.',
            code: 'ROLE_NOT_ALLOWED'
          });
        }

        // Store user data and tokens in the encrypted session
        setSessionData(session, {
          user: response.data.body.user,
          accessToken: response.data.body.accessToken,
          refreshToken: response.data.body.refreshToken,
          isLoggedIn: true
        });

        await session.save();

        // Return success response without tokens (they're now stored server-side)
        return res.status(200).json({
          message: 'Login successful',
          body: {
            user: response.data.body.user
          }
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ message: 'Internal server error' });
      }
    };
  },

  createLogoutHandler: (options: ApiRouteOptions) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      try {
        const session = await getSession(req, res);

        // Mock logout for development/testing
        if (!process.env.BACKEND_URL) {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Clear the session
          clearSessionData(session);
          await session.save();

          return res.status(200).json({
            message: 'Logout successful'
          });
        }

        // Real backend call
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        // Add authorization header if user is logged in and has access token
        if (session.accessToken) {
          headers['Authorization'] = `Bearer ${session.accessToken}`;
        }

        const url = `${process.env.BACKEND_URL}${options.endpoint}`;
        const response = await axios.post(
          url,
          {},
          {
            headers,
            timeout: options.timeout || 30000
          }
        );

        // Clear the session regardless of backend response
        clearSessionData(session);
        await session.save();

        return res.status(200).json(response.data);
      } catch (error) {
        console.error('Logout API error:', error);

        // Even if there's an error, try to clear the session
        try {
          const session = await getSession(req, res);
          clearSessionData(session);
          await session.save();
        } catch (sessionError) {
          console.error('Session clear error:', sessionError);
        }

        if (axios.isAxiosError(error) && error.response) {
          return res.status(error.response.status).json(error.response.data);
        }
        return res.status(500).json({ message: 'Internal server error' });
      }
    };
  }
};
