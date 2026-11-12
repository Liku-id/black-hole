// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

configure({ asyncUtilTimeout: 5000 });

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn()
      },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      defaultLocale: 'en',
      domainLocales: [],
      isPreview: false
    };
  }
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />;
  }
}));

// Polyfills for jsdom environment
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
}

if (typeof URL !== 'undefined' && !URL.createObjectURL) {
  URL.createObjectURL = jest.fn(() => 'blob:mock-url');
}

if (typeof URL !== 'undefined' && !URL.revokeObjectURL) {
  URL.revokeObjectURL = jest.fn();
}
