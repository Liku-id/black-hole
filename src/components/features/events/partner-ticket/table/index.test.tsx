import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

import PartnerEventTable from './index';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

const mockPush = jest.fn();

describe('PartnerEventTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/',
      query: {},
      asPath: '/'
    });
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
  });

  const partnerWithoutLink = {
    id: 'p1',
    partnerName: 'Partner Alpha',
    picName: 'Alice',
    picPhoneNumber: '+628123456789',
    totalRevenue: '1500000',
    linkExpiredDate: undefined,
    privateLink: undefined
  };

  const partnerWithLink = {
    id: 'p2',
    partnerName: 'Partner Beta',
    picName: 'Bob',
    picPhoneNumber: '+628987654321',
    totalRevenue: '2500000',
    linkExpiredDate: '2026-12-31T10:00:00Z',
    privateLink: 'https://example.com/private/p2'
  };

  it('renders loading and empty states without pagination when partners is empty', () => {
    const { rerender } = render(
      <PartnerEventTable partners={[]} loading={true} />
    );
    expect(screen.getAllByText('Loading partners...').length).toBeGreaterThan(
      0
    );

    rerender(<PartnerEventTable partners={[]} loading={false} />);
    expect(
      screen.getAllByText('No partner data available').length
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Showing/i)).not.toBeInTheDocument();
  });

  it('renders partner rows, copies private link, and invokes all menu actions', async () => {
    const onCreatePrivateLink = jest.fn();
    const onTransactionList = jest.fn();
    const onEdit = jest.fn();
    const onPageChange = jest.fn();

    render(
      <PartnerEventTable
        partners={[partnerWithoutLink, partnerWithLink]}
        total={20}
        currentPage={0}
        pageSize={10}
        metaUrl="my-event"
        onPageChange={onPageChange}
        onCreatePrivateLink={onCreatePrivateLink}
        onTransactionList={onTransactionList}
        onEdit={onEdit}
      />
    );

    expect(screen.getAllByText('Partner Alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Partner Beta').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText('https://example.com/private/p2').length
    ).toBeGreaterThan(0);

    // Click desktop Copy button
    const copyBtns = screen.getAllByAltText('Copy');
    fireEvent.click(copyBtns[0].closest('button')!);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/private/p2'
    );

    // Expand mobile cards and test mobile Copy button
    const expandBtns = screen.getAllByLabelText('Expand');
    fireEvent.click(expandBtns[0].closest('[role="button"]')!);
    fireEvent.click(expandBtns[1].closest('[role="button"]')!);
    const allCopyBtnsAfterExpand = screen.getAllByAltText('Copy');
    fireEvent.click(allCopyBtnsAfterExpand[0].closest('button')!);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(2);

    // Row 1 menu (no private link): Create Private Link, Transaction List, Edit Partner
    const optionsBtns = screen.getAllByAltText('Options');
    fireEvent.click(optionsBtns[0].closest('button')!);
    fireEvent.click(
      screen.getByRole('menuitem', { name: /Create Private Link/i })
    );
    expect(onCreatePrivateLink).toHaveBeenCalledWith(partnerWithoutLink);

    fireEvent.click(optionsBtns[0].closest('button')!);
    fireEvent.click(
      screen.getByRole('menuitem', { name: /Transaction List/i })
    );
    expect(onTransactionList).toHaveBeenCalledWith(partnerWithoutLink);

    fireEvent.click(optionsBtns[0].closest('button')!);
    fireEvent.click(screen.getByRole('menuitem', { name: /Edit Partner/i }));
    expect(onEdit).toHaveBeenCalledWith(partnerWithoutLink);

    // Row 2 menu (has private link): Check Private Link
    fireEvent.click(optionsBtns[1].closest('button')!);
    fireEvent.click(
      screen.getByRole('menuitem', { name: /Check Private Link/i })
    );
    expect(mockPush).toHaveBeenCalledWith(
      '/events/my-event/partner-ticket/view-private-link?partnerId=p2'
    );
  });

  it('closes menu on Escape and handles pagination', async () => {
    const onPageChange = jest.fn();

    render(
      <PartnerEventTable
        partners={[partnerWithoutLink, partnerWithLink]}
        total={20}
        currentPage={0}
        pageSize={10}
        metaUrl="my-event"
        onPageChange={onPageChange}
      />
    );

    const optionsBtns = screen.getAllByAltText('Options');
    fireEvent.click(optionsBtns[0].closest('button')!);
    const menu = await screen.findByRole('menu');
    fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    );

    fireEvent.click(
      screen.getAllByTestId('KeyboardArrowRightIcon')[0].closest('button')!
    );
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('does not navigate when metaUrl is missing', () => {
    render(<PartnerEventTable partners={[partnerWithLink]} />);

    fireEvent.click(screen.getAllByAltText('Options')[0].closest('button')!);
    fireEvent.click(
      screen.getByRole('menuitem', { name: /Check Private Link/i })
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
