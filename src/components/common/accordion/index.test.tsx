import { render, screen, fireEvent } from '@testing-library/react';

import { CustomAccordion } from './index';

describe('CustomAccordion', () => {
  it('renders title correctly', () => {
    render(
      <CustomAccordion title="Test Accordion">
        <div>Content</div>
      </CustomAccordion>
    );
    expect(screen.getByText('Test Accordion')).toBeInTheDocument();
  });

  it('renders content when expanded', () => {
    render(
      <CustomAccordion title="Test Accordion" defaultExpanded>
        <div>Visible Content</div>
      </CustomAccordion>
    );
    expect(screen.getByText('Visible Content')).toBeVisible();
  });

  it('toggles content on click in uncontrolled mode', () => {
    render(
      <CustomAccordion title="Test Accordion">
        <div>Content</div>
      </CustomAccordion>
    );
    const summary = screen.getByRole('button');
    fireEvent.click(summary);
    expect(screen.getByText('Content')).toBeVisible();

    fireEvent.click(summary);
    expect(summary).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports controlled mode and disabled state', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <CustomAccordion
        title="Controlled"
        expanded={false}
        onChange={handleChange}
      >
        <div>Body</div>
      </CustomAccordion>
    );

    const summary = screen.getByRole('button');
    fireEvent.click(summary);
    expect(handleChange).toHaveBeenCalledWith(expect.anything(), true);

    rerender(
      <CustomAccordion
        title="Controlled"
        expanded={true}
        disabled={true}
        onChange={handleChange}
      >
        <div>Body</div>
      </CustomAccordion>
    );

    handleChange.mockClear();
    fireEvent.click(summary);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
