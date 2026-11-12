import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import { CustomTextArea } from './index';

describe('CustomTextArea', () => {
  it('renders standalone textarea with empty and filled values and error state', () => {
    const { container, rerender } = renderWithProviders(
      <CustomTextArea
        label="Comment"
        value=""
        maxLength={50}
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Comment')).toBeInTheDocument();

    rerender(
      <CustomTextArea
        error
        label="Comment"
        value="Non-empty content"
        height="120px"
        onChange={() => {}}
      />
    );
    expect(container.querySelector('.Mui-error')).toBeInTheDocument();
  });

  it('integrates with React Hook Form, maxLength rule, and rejected state', async () => {
    const RHFWrapper = () => {
      const methods = useForm({
        defaultValues: { notes: '' },
        mode: 'onChange'
      });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <CustomTextArea
              name="notes"
              label="Notes"
              placeholder="Write notes"
              isRejected
              maxLength={5}
            />
            <button type="submit">Save</button>
          </form>
        </FormProvider>
      );
    };

    const { container } = render(<RHFWrapper />);
    expect(
      container.querySelector('[data-testid="ErrorOutlineIcon"]')
    ).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText('Write notes');
    fireEvent.change(textarea, { target: { value: 'Too long text' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(
        screen.getByText('Maximum 5 characters allowed')
      ).toBeInTheDocument();
    });
  });
});
