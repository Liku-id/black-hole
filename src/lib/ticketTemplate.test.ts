import { ticketTemplate } from './ticketTemplate';

describe('ticketTemplate', () => {
  const sampleTicket = {
    eventName: 'Black Hole Music Festival',
    eventOrganizerName: 'Liku Organizer',
    type: 'VIP Pass',
    qrValue: 'TICKET-12345',
    attendee: 'Jane Doe',
    date: '2026-12-01 19:00',
    address: 'Jakarta Convention Center'
  };

  it('renders valid HTML document structure even when tickets array is empty', () => {
    const html = ticketTemplate([]);

    expect(html).toContain('<html>');
    expect(html).toContain('<head>');
    expect(html).toContain('<style>');
    expect(html).toContain('<body>');
    expect(html).toContain('</html>');
    expect(html).not.toContain('<div class="ticket-container">');
  });

  it('renders a single ticket with all provided fields', () => {
    const html = ticketTemplate([sampleTicket]);

    expect(html).toContain(
      '<div class="event-title">Black Hole Music Festival</div>'
    );
    expect(html).toContain('<div class="organizer">Liku Organizer</div>');
    expect(html).toContain('<div class="ticket-type">VIP Pass</div>');
    expect(html).toContain(
      'src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-12345"'
    );
    expect(html).toContain('<div class="visitor-name">Jane Doe</div>');
    expect(html).toContain('<div class="info-text">2026-12-01 19:00</div>');
    expect(html).toContain(
      '<div class="info-text">Jakarta Convention Center</div>'
    );
  });

  it('uses fallback values when optional ticket properties are missing', () => {
    const minimalTicket = {
      qrValue: 'MIN-999',
      attendee: 'John Smith'
    };

    const html = ticketTemplate([minimalTicket]);

    expect(html).toContain('<div class="event-title"></div>');
    expect(html).toContain('<div class="organizer"></div>');
    expect(html).toContain('<div class="ticket-type">General Admission</div>');
    expect(html).toContain('<div class="visitor-name">John Smith</div>');
    expect(html).toContain(
      'src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MIN-999"'
    );
    // Date and address both fall back to empty string
    const infoTextMatches = html.match(/<div class="info-text"><\/div>/g);
    expect(infoTextMatches).toHaveLength(2);
  });

  it('uses fallback values when optional ticket properties are empty strings', () => {
    const emptyFieldsTicket = {
      eventName: '',
      eventOrganizerName: '',
      type: '',
      qrValue: 'EMPTY-1',
      attendee: 'Alice',
      date: '',
      address: ''
    };

    const html = ticketTemplate([emptyFieldsTicket]);

    expect(html).toContain('<div class="event-title"></div>');
    expect(html).toContain('<div class="organizer"></div>');
    expect(html).toContain('<div class="ticket-type">General Admission</div>');
    const infoTextMatches = html.match(/<div class="info-text"><\/div>/g);
    expect(infoTextMatches).toHaveLength(2);
  });

  it('renders multiple tickets without separator characters between containers', () => {
    const secondTicket = {
      eventName: 'After Party',
      eventOrganizerName: 'EKUID Events',
      type: 'Early Bird',
      qrValue: 'TICKET-67890',
      attendee: 'Bob Builder',
      date: '2026-12-02 22:00',
      address: 'SCBD Lot 8'
    };

    const html = ticketTemplate([sampleTicket, secondTicket]);

    const containerMatches = html.match(/<div class="ticket-container">/g);
    expect(containerMatches).toHaveLength(2);
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Bob Builder');
    expect(html).toContain('VIP Pass');
    expect(html).toContain('Early Bird');
    expect(html).not.toContain('</div>\n          ,\n          <div');
    expect(html).not.toContain('</div>,<div');
  });
});
