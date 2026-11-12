import { fireEvent, render, screen } from '@testing-library/react';
import { useContext } from 'react';

import ThemeProviderWrapper, { ThemeContext } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('renders children and persists theme name via ThemeContext', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const Consumer = () => {
      const setTheme = useContext(ThemeContext);
      return <button onClick={() => setTheme('dark')}>Set Theme</button>;
    };

    render(
      <ThemeProviderWrapper>
        <Consumer />
      </ThemeProviderWrapper>
    );

    fireEvent.click(screen.getByText('Set Theme'));
    expect(setItemSpy).toHaveBeenCalledWith('appTheme', 'dark');
    setItemSpy.mockRestore();
  });

  it('invokes default ThemeContext no-op safely without provider', () => {
    const DefaultConsumer = () => {
      const setTheme = useContext(ThemeContext);
      return <button onClick={() => setTheme('light')}>Default Theme</button>;
    };

    render(<DefaultConsumer />);
    expect(() =>
      fireEvent.click(screen.getByText('Default Theme'))
    ).not.toThrow();
  });
});
