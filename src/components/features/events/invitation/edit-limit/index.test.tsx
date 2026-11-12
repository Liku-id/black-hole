import { fireEvent, render, screen } from '@testing-library/react';

import { EditInvitationLimitModal } from './index';

describe('EditInvitationLimitModal', () => {
  it('initializes blank for -1 limit, validates positive integer, and saves valid limit', () => {
    const onSubmit = jest.fn();
    const onClose = jest.fn();

    const { rerender } = render(
      <EditInvitationLimitModal
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        currentLimit={-1}
      />
    );

    const input = screen.getByPlaceholderText('e.g. 500');
    expect(input).toHaveValue(null);

    // Invalid empty/0 limit
    fireEvent.click(screen.getByRole('button', { name: 'Save Limit' }));
    expect(
      screen.getByText(
        'Limit must be a positive number greater than or equal to 1'
      )
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    // Reopen with numeric limit 250
    rerender(
      <EditInvitationLimitModal
        open={false}
        onClose={onClose}
        onSubmit={onSubmit}
        currentLimit={250}
      />
    );
    rerender(
      <EditInvitationLimitModal
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        currentLimit={250}
      />
    );
    expect(screen.getByPlaceholderText('e.g. 500')).toHaveValue(250);

    fireEvent.change(screen.getByPlaceholderText('e.g. 500'), {
      target: { value: '500' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Limit' }));
    expect(onSubmit).toHaveBeenCalledWith(500);

    // Loading state and Cancel button
    rerender(
      <EditInvitationLimitModal
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        currentLimit={500}
        loading={true}
      />
    );
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();

    rerender(
      <EditInvitationLimitModal
        open={true}
        onClose={onClose}
        onSubmit={onSubmit}
        currentLimit={500}
        loading={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
