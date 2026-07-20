import React from 'react';

export function CollapsibleCardListMock<T>({
  items,
  getKey,
  loading = false,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data found',
  renderTitle,
  renderSubtitle,
  renderTitleMeta,
  renderDetails,
  renderActions
}: {
  items: T[];
  getKey: (item: T) => string;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  renderTitle: (item: T, index: number) => React.ReactNode;
  renderSubtitle?: (item: T, index: number) => React.ReactNode;
  renderTitleMeta?: (item: T, index: number) => React.ReactNode;
  renderDetails?: (
    item: T,
    index: number
  ) => Array<{ label: string; value: React.ReactNode }>;
  renderActions?: (item: T, index: number) => React.ReactNode;
}) {
  if (loading) {
    return <div>{loadingMessage}</div>;
  }

  if (items.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <div data-testid="collapsible-card-list">
      {items.map((item, index) => (
        <div key={getKey(item)} data-testid={`card-item-${getKey(item)}`}>
          <div>{renderTitle(item, index)}</div>
          {renderSubtitle?.(item, index)}
          {renderTitleMeta?.(item, index)}
          {renderDetails?.(item, index)?.map((detail) => (
            <div key={detail.label}>{detail.value}</div>
          ))}
          {renderActions?.(item, index)}
        </div>
      ))}
    </div>
  );
}
