import { render, screen } from '@testing-library/react';
import React from 'react';

import { H1, H2, H3, H4, Body1, Body2, Caption, Overline } from './index';

describe('Typography', () => {
  it('renders H1 correctly', () => {
    render(<H1>Heading 1</H1>);
    const element = screen.getByText('Heading 1');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('P'); // MUI Typography defaults to p unless mapped, or component is specified. Default usually makes it P with class.
  });

  it('renders H2 correctly', () => {
    render(<H2>Heading 2</H2>);
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
  });

  it('renders H3 correctly', () => {
    render(<H3>Heading 3</H3>);
    expect(screen.getByText('Heading 3')).toBeInTheDocument();
  });

  it('renders H4 correctly', () => {
    render(<H4>Heading 4</H4>);
    expect(screen.getByText('Heading 4')).toBeInTheDocument();
  });

  it('renders Body1 correctly', () => {
    render(<Body1>Body Text 1</Body1>);
    expect(screen.getByText('Body Text 1')).toBeInTheDocument();
  });

  it('renders Body2 correctly', () => {
    render(<Body2>Body Text 2</Body2>);
    expect(screen.getByText('Body Text 2')).toBeInTheDocument();
  });

  it('renders Caption correctly', () => {
    render(<Caption>Caption Text</Caption>);
    expect(screen.getByText('Caption Text')).toBeInTheDocument();
  });

  it('renders Overline correctly', () => {
    render(<Overline>Overline Text</Overline>);
    expect(screen.getByText('Overline Text')).toBeInTheDocument();
  });

  it('accepts fontWeight prop', () => {
    render(<H1 fontWeight={700}>Bold Heading</H1>);
    const element = screen.getByText('Bold Heading');
    expect(element).toHaveStyle({ fontWeight: '700' });
  });
});
