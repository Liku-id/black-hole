import { ticketTemplate } from './ticketTemplate';

describe('ticketTemplate', () => {
  it('renders valid HTML document with empty tickets array', () => {
    const html = ticketTemplate([]);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain("<title>Endgame | What's Your Endgame?</title>");
    expect(html).not.toContain('class="ticket-card"');
  });

  it('renders single ticket with encoded QR value and ticket details', () => {
    const html = ticketTemplate([
      {
        eventOrganizerName: 'Wukong EO',
        eventName: 'Summer Fest',
        type: 'VVIP',
        qrValue: 'TICKET-123&special=1',
        attendee: 'Alice',
        date: '10 Aug 2026',
        address: 'GBK Jakarta'
      }
    ]);

    expect(html).toContain('Wukong EO | Summer Fest');
    expect(html).toContain('VVIP #1');
    expect(html).toContain('Alice');
    expect(html).toContain('10 Aug 2026');
    expect(html).toContain('GBK Jakarta');
    expect(html).toContain(
      `data=${encodeURIComponent('TICKET-123&special=1')}`
    );
  });

  it('renders multiple tickets with sequential numbering', () => {
    const html = ticketTemplate([
      {
        eventOrganizerName: 'EO One',
        eventName: 'Event One',
        type: 'REG',
        qrValue: 'QR1',
        attendee: 'Bob',
        date: '11 Aug 2026',
        address: 'Venue 1'
      },
      {
        eventOrganizerName: 'EO One',
        eventName: 'Event One',
        type: 'VIP',
        qrValue: 'QR2',
        attendee: 'Carol',
        date: '11 Aug 2026',
        address: 'Venue 2'
      }
    ]);

    expect(html).toContain('REG #1');
    expect(html).toContain('Bob');
    expect(html).toContain('VIP #2');
    expect(html).toContain('Carol');
  });
});
