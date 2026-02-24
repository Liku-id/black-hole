import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import CustomModal from './index';

describe('CustomModal', () => {
  it('renders when open is true', () => {
    render(
      <CustomModal open={true} title="Test Modal">
        <div>Modal Content</div>
      </CustomModal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <CustomModal open={false} title="Test Modal">
        <div>Modal Content</div>
      </CustomModal>
    );
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = jest.fn();
    render(
      <CustomModal open={true} title="Test Modal" onClose={handleClose}>
        <div>Modal Content</div>
      </CustomModal>
    );
    const closeBtn = screen.getByRole('img', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
