import { fireEvent, render, screen } from '@testing-library/react';

import { UserRole } from '@/types/auth';

import { DrawerContent } from './index';

let mockPathname = '/dashboard';
const mockIsMenuActiveCalls: boolean[] = [];

jest.mock('../styles', () => ({
  LogoContainer: ({ children }: any) => <div>{children}</div>,
  UserMenuContainer: ({ children }: any) => <div>{children}</div>
}));

jest.mock('./menu', () => ({
  MenuList: ({
    menuItems,
    isMenuItemActive,
    isSubMenuItemActive,
    onAccountMenuToggle
  }: any) => {
    menuItems.forEach((item: any) => {
      mockIsMenuActiveCalls.push(isMenuItemActive(item.path));
      item.subMenu?.forEach((sub: any) => {
        isSubMenuItemActive(sub.path);
      });
    });
    return (
      <div>
        <div>Menu List</div>
        <button onClick={onAccountMenuToggle}>toggle-account</button>
      </div>
    );
  }
}));

jest.mock('./profile-content', () => ({
  ProfileContent: () => <div>Profile Content</div>
}));

jest.mock('./profile-menu', () => ({
  ProfileMenu: () => <div>Profile Menu</div>
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: mockPathname })
}));

describe('DrawerContent', () => {
  beforeEach(() => {
    mockPathname = '/dashboard';
    mockIsMenuActiveCalls.length = 0;
  });

  it('renders correctly without sessionRole and handles sub-routes and account submenu', () => {
    const { rerender } = render(
      <DrawerContent
        user={{}}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
        onProfileMenuClose={() => {}}
        onLogout={() => {}}
      />
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Menu List')).toBeInTheDocument();

    fireEvent.click(screen.getByText('toggle-account'));

    // Unknown role
    rerender(
      <DrawerContent
        sessionRole="unknown_role"
        user={{}}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
        onProfileMenuClose={() => {}}
        onLogout={() => {}}
      />
    );

    // /events/* active branch
    mockPathname = '/events/ev-1';
    rerender(
      <DrawerContent
        sessionRole={UserRole.EVENT_ORGANIZER_PIC}
        user={{}}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
        onProfileMenuClose={() => {}}
        onLogout={() => {}}
      />
    );

    // /finance/* active branch
    mockPathname = '/finance/withdrawal';
    rerender(
      <DrawerContent
        sessionRole={UserRole.FINANCE}
        user={{}}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
        onProfileMenuClose={() => {}}
        onLogout={() => {}}
      />
    );

    // generic nested segment branch (/creator/detail)
    mockPathname = '/creator/detail';
    rerender(
      <DrawerContent
        sessionRole={UserRole.ADMIN}
        user={{}}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
        onProfileMenuClose={() => {}}
        onLogout={() => {}}
      />
    );

    // auto-expand account submenu on /team
    mockPathname = '/team';
    rerender(
      <DrawerContent
        sessionRole={UserRole.EVENT_ORGANIZER_PIC}
        user={{}}
        anchorEl={null}
        onProfileMenuOpen={() => {}}
        onProfileMenuClose={() => {}}
        onLogout={() => {}}
      />
    );
    expect(mockIsMenuActiveCalls.length).toBeGreaterThan(0);
  });
});
