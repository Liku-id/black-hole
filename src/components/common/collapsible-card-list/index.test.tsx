import { fireEvent, render, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test-utils/renderWithProviders';

import CollapsibleCardList from './index';

type Item = {
  id: string;
  name: string;
  subtitle?: string;
  meta?: string;
  count: number;
};

describe('CollapsibleCardList', () => {
  const items: Item[] = [
    {
      id: '1',
      name: 'First Item',
      subtitle: 'Sub 1',
      meta: 'Meta 1',
      count: 42
    },
    {
      id: '2',
      name: 'Second Item',
      count: 10
    }
  ];

  it('renders loading state with custom loadingMessage', () => {
    render(
      <CollapsibleCardList
        items={[]}
        loading
        loadingMessage="Fetching rows..."
        getKey={(item) => item.id}
        renderTitle={(item) => item.name}
        renderDetails={() => []}
      />
    );
    expect(screen.getByText('Fetching rows...')).toBeInTheDocument();
  });

  it('renders empty state with default and custom emptyMessage', () => {
    const { rerender } = render(
      <CollapsibleCardList
        items={[]}
        getKey={(item) => item.id}
        renderTitle={(item) => item.name}
        renderDetails={() => []}
      />
    );
    expect(screen.getByText('No data found')).toBeInTheDocument();

    rerender(
      <CollapsibleCardList
        items={[]}
        emptyMessage="Nothing here"
        getKey={(item) => item.id}
        renderTitle={(item) => item.name}
        renderDetails={() => []}
      />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('expands and collapses via click and keyboard, and isolates meta/action clicks', () => {
    const actionClick = jest.fn();
    const metaClick = jest.fn();

    renderWithProviders(
      <CollapsibleCardList
        items={items}
        getKey={(item) => item.id}
        renderTitle={(item) => item.name}
        renderSubtitle={(item) => item.subtitle}
        renderTitleMeta={(item) =>
          item.meta ? <button onClick={metaClick}>{item.meta}</button> : null
        }
        renderDetails={(item) => [
          { label: 'Count Label', value: item.count },
          { label: 'String Label', value: 'Plain text' },
          {
            label: 'Node Label',
            value: <span>Custom Node</span>
          }
        ]}
        renderActions={(item) => (
          <button onClick={() => actionClick(item.id)}>Action {item.id}</button>
        )}
      />
    );

    const buttons = screen.getAllByRole('button', { expanded: false });
    expect(buttons).toHaveLength(2);

    // Click meta or action should not expand card
    fireEvent.click(screen.getByText('Meta 1'));
    expect(metaClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Count Label')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Action 1'));
    expect(actionClick).toHaveBeenCalledWith('1');
    expect(screen.queryByText('Count Label')).not.toBeInTheDocument();

    // Click card row to expand
    fireEvent.click(screen.getByText('First Item'));
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Plain text')).toBeInTheDocument();
    expect(screen.getByText('Custom Node')).toBeInTheDocument();

    // Keyboard toggle with Enter & Space and ignore other keys
    const row1 = screen.getByText('First Item').closest('[role="button"]')!;
    fireEvent.keyDown(row1, { key: 'Tab' });
    expect(screen.getByText('42')).toBeInTheDocument();

    fireEvent.keyDown(row1, { key: 'Enter' });
    fireEvent.keyDown(row1, { key: ' ' });
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
