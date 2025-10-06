declare global {
  interface Window {
    posthog: {
      capture: (eventName: string, properties?: Record<string, any>) => void;
      identify: (userId: string, properties?: Record<string, any>) => void;
      setPersonProperties: (properties: Record<string, any>) => void;
      reset: () => void;
      init: (key: string, config?: any) => void;
      __loaded: boolean;
      _i: any[];
    };
  }
}

export {};
