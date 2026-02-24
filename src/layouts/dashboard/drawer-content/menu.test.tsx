import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { MenuList } from './menu';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock('../styles', () => ({
  StyledList: ({ children }: any) => <ul>{children}</ul>,
  StyledMenuItem: ({ children, onClick }: any) => <li onClick={onClick}>{children}</li>,
  StyledSubMenuItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
  StyledListItemIcon: ({ children }: any) => <span>{children}</span>
}));

const menuItems = [
  { text: 'Dashboard', icon: '/icon.svg', path: '/dashboard', id: 'dash' },
  { 
      text: 'Account', 
      icon: '/icon.svg', 
      path: '/account', 
      id: 'acc',
      subMenu: [
          { text: 'Sub', path: '/account/sub', id: 'sub' }
      ]
  }
];

describe('MenuList', () => {
  it('renders menu items', () => {
    render(
      <MenuList
        menuItems={menuItems}
        accountMenuOpen={false}
        onAccountMenuToggle={() => {}}
        isMenuItemActive={() => false}
        isSubMenuItemActive={() => false}
      />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders submenu when open', () => {
    render(
      <MenuList
        menuItems={menuItems}
        accountMenuOpen={true}
        onAccountMenuToggle={() => {}}
        isMenuItemActive={() => false}
        isSubMenuItemActive={() => false}
      />
    );
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('navigates on click', () => {
    render(
        <MenuList
          menuItems={menuItems}
          accountMenuOpen={false}
          onAccountMenuToggle={() => {}}
          isMenuItemActive={() => false}
          isSubMenuItemActive={() => false}
        />
      );
      fireEvent.click(screen.getByText('Dashboard'));
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
