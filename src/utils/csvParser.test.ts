import { parseCSV } from './csvParser';

describe('parseCSV', () => {
  const OriginalFileReader = global.FileReader;

  afterEach(() => {
    global.FileReader = OriginalFileReader;
    jest.restoreAllMocks();
  });

  const mockFileReaderResult = (result: string | ArrayBuffer | null) => {
    const reader: any = {
      readAsText: jest.fn(function () {
        this.onload?.({ target: { result } });
      })
    };
    global.FileReader = jest.fn(() => reader) as any;
  };

  it('parses valid CSV with quoted fields, blank lines, and case-insensitive headers', async () => {
    const csv = [
      'Full Name, E-mail, Phone Number, Ticket Type, Ticket Qty',
      '"Doe, John",john@example.com,08123456789,VIP,2',
      '',
      'Jane,,08987654321,Regular,',
      'onlyonecolumn',
      ',onlyemail@example.com,,,1',
      ',,,,0'
    ].join('\n');

    mockFileReaderResult(csv);
    const file = new File([csv], 'recipients.csv', { type: 'text/csv' });

    const rows = await parseCSV(file);

    expect(rows).toEqual([
      {
        name: 'Doe, John',
        email: 'john@example.com',
        phone: '08123456789',
        ticketTypeName: 'VIP',
        ticketQty: '2'
      },
      {
        name: 'Jane',
        email: '',
        phone: '08987654321',
        ticketTypeName: 'Regular',
        ticketQty: '0'
      },
      {
        name: '',
        email: 'onlyemail@example.com',
        phone: '',
        ticketTypeName: '',
        ticketQty: '1'
      }
    ]);
  });

  it('handles CRLF line endings and unknown headers', async () => {
    const csv = 'Full Name,Unknown Col\r\nAlice,ignored\r\n';
    mockFileReaderResult(csv);
    const file = new File([csv], 'test.csv', { type: 'text/csv' });

    const rows = await parseCSV(file);
    expect(rows).toEqual([
      {
        name: 'Alice',
        email: '',
        phone: '',
        ticketTypeName: '',
        ticketQty: '0'
      }
    ]);
  });

  it('rejects when FileReader result is not a string', async () => {
    mockFileReaderResult(new ArrayBuffer(8));
    const file = new File(['x'], 'bad.csv', { type: 'text/csv' });

    await expect(parseCSV(file)).rejects.toThrow('Failed to read file');
  });

  it('rejects when FileReader triggers onerror', async () => {
    const reader: any = {
      readAsText: jest.fn(function () {
        this.onerror?.();
      })
    };
    global.FileReader = jest.fn(() => reader) as any;

    const file = new File(['x'], 'err.csv', { type: 'text/csv' });
    await expect(parseCSV(file)).rejects.toThrow('Error reading file');
  });
});
