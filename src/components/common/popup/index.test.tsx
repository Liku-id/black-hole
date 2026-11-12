import { fireEvent, render, screen } from '@testing-library/react';

import { Popup } from './index';

describe('Popup', () => {
  it('renders when open with footer and custom titleSize and locks body scroll', () => {
    const { unmount } = render(
      <Popup
        open={true}
        title="Test Popup"
        titleSize="18px"
        footer={<div>Footer Content</div>}
        onClose={() => {}}
      >
        <div>Popup Content</div>
      </Popup>
    );

    expect(screen.getByText('Test Popup')).toBeInTheDocument();
    expect(screen.getByText('Popup Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('does not render when closed', () => {
    render(
      <Popup open={false} title="Test Popup" onClose={() => {}}>
        <div>Popup Content</div>
      </Popup>
    );
    expect(screen.queryByText('Test Popup')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('closes on overlay click and Escape key, but stops propagation inside content', () => {
    const handleClose = jest.fn();
    const { container } = render(
      <Popup open={true} title="Test Popup" onClose={handleClose}>
        <div>Popup Content</div>
      </Popup>
    );

    // Click inside content should NOT call onClose
    fireEvent.click(screen.getByText('Popup Content'));
    expect(handleClose).not.toHaveBeenCalled();

    // Click on overlay should call onClose
    fireEvent.click(container.firstChild as HTMLElement);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Non-Escape key does not close
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape key calls onClose
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
