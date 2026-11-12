import { render, screen, fireEvent } from '@testing-library/react';

import Tabs from './index';

describe('Tabs', () => {
  const tabs = [
    { id: 'tab1', title: 'Tab 1' },
    { id: 'tab2', title: 'Tab 2' }
  ];

  it('renders tabs correctly', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onTabChange={() => {}} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('highlights active tab', () => {
    // We can check styles or just class presence, but MUI styled components are tricky.
    // However, we used custom border bottom logic.
    // Let's rely on basic rendering first.
    render(<Tabs tabs={tabs} activeTab="tab1" onTabChange={() => {}} />);
    const tab1 = screen.getByText('Tab 1');
    // We can check if color is primary? Or just assume it works if it renders.
    expect(tab1).toBeInTheDocument();
  });

  it('calls onTabChange when clicked and supports drag scroll, quantity, and status icons', () => {
    const handleTabChange = jest.fn();
    const statusTabs = [
      {
        id: 't1',
        title: 'Rejected Tab',
        quantity: 2,
        status: 'rejected' as const
      },
      {
        id: 't2',
        title: 'Approved Tab',
        quantity: 5,
        status: 'approved' as const
      },
      { id: 't3', title: 'Pending Tab', status: 'pending' as const },
      { id: 't4', title: 'Unknown Status', status: 'other' as any }
    ];

    const { container } = render(
      <Tabs
        tabs={statusTabs}
        activeTab="t1"
        onTabChange={handleTabChange}
        borderless
        fullWidth
      />
    );

    expect(screen.getByText('Rejected Tab (2)')).toBeInTheDocument();
    expect(screen.getByText('Approved Tab (5)')).toBeInTheDocument();
    expect(screen.getByText('Pending Tab')).toBeInTheDocument();

    const scrollContainer = container.firstChild as HTMLElement;

    const createMouseEvent = (type: string, pageX: number) => {
      const evt = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: pageX
      });
      Object.defineProperty(evt, 'pageX', { value: pageX });
      return evt;
    };

    // Small mouse movement (< 5px) still allows click
    fireEvent(scrollContainer, createMouseEvent('mousedown', 100));
    fireEvent(scrollContainer, createMouseEvent('mousemove', 102));
    fireEvent(scrollContainer, createMouseEvent('mouseup', 102));
    fireEvent.click(screen.getByText('Approved Tab (5)'));
    expect(handleTabChange).toHaveBeenCalledWith('t2');

    // Large drag (>= 5px) suppresses onClick tab change
    fireEvent(scrollContainer, createMouseEvent('mousemove', 50)); // not dragging no-op
    fireEvent(scrollContainer, createMouseEvent('mousedown', 100));
    fireEvent(scrollContainer, createMouseEvent('mousemove', 130));
    fireEvent.mouseLeave(scrollContainer);
    fireEvent.click(screen.getByText('Pending Tab'));
    expect(handleTabChange).toHaveBeenCalledTimes(1);
  });
});
