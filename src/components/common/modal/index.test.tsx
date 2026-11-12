import { fireEvent, render, screen } from '@testing-library/react';

import CustomModal from './index';

describe('CustomModal', () => {
  it('renders when open is true with custom titleSize and footer', () => {
    render(
      <CustomModal
        open={true}
        title="Test Modal"
        titleSize="16px"
        footer={<div>Modal Footer</div>}
      >
        <div>Modal Content</div>
      </CustomModal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Modal Footer')).toBeInTheDocument();
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  it('handles close safely when onClose is omitted', () => {
    render(
      <CustomModal open={true} title="No Handler">
        <div>Inner</div>
      </CustomModal>
    );
    const presentation = screen.getByRole('presentation');
    fireEvent.keyDown(presentation, { key: 'Escape', code: 'Escape' });
    expect(screen.getByText('Inner')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <CustomModal open={false} title="Test Modal">
        <div>Modal Content</div>
      </CustomModal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose via Close button and Escape key', () => {
    const handleClose = jest.fn();
    render(
      <CustomModal open={true} title="Test Modal" onClose={handleClose}>
        <div>Modal Content</div>
      </CustomModal>
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('presentation'), {
      key: 'Escape',
      code: 'Escape'
    });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
