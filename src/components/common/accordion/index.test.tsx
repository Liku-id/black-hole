import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

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

  it('toggles content on click', () => {
    render(
      <CustomAccordion title="Test Accordion">
        <div>Content</div>
      </CustomAccordion>
    );
    const summary = screen.getByRole('button');
    fireEvent.click(summary);
    expect(screen.getByText('Content')).toBeVisible();
    
    // Toggle back
    fireEvent.click(summary);
    // In MUI Accordion, content is usually still in DOM but hidden or collapsed.
    // We check if the button aria-expanded changes.
    expect(summary).toHaveAttribute('aria-expanded', 'false');
  });
});
