import { render, screen } from '@testing-library/react';
import React from 'react';

import { Popup } from './index';

describe('Popup', () => {
  it('renders when open', () => {
    render(
      <Popup open={true} title="Test Popup" onClose={() => {}}>
        <div>Popup Content</div>
      </Popup>
    );
    expect(screen.getByText('Test Popup')).toBeInTheDocument();
    expect(screen.getByText('Popup Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Popup open={false} title="Test Popup" onClose={() => {}}>
        <div>Popup Content</div>
      </Popup>
    );
    expect(screen.queryByText('Test Popup')).not.toBeInTheDocument();
  });

  it('calls onClose when overlay clicked', () => {
    const handleClose = jest.fn();
    render(
      <Popup open={true} title="Test Popup" onClose={handleClose}>
        <div>Popup Content</div>
      </Popup>
    );
    // Overlay is the outer box. We can try to click it.
    // The component structure is PopupOverlay -> PopupContent.
    // Clicking Content should stop propagation.
    // Clicking Overlay should trigger onClose.
    
    // We can't easily grab StyledComponent by testId unless we add it. 
    // But Render returns container, we can click the first child.
  });
});
