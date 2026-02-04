
export interface ParsedRecipient {
  name: string;
  email: string;
  phone: string;
  ticketTypeName: string;
  ticketQty: string;
}

export const parseCSV = async (file: File): Promise<ParsedRecipient[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }

      const lines = text.split(/\r\n|\n/);
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      
      // Expected headers mapping (normalized to lower case)
      const headerMap: { [key: string]: string } = {
        'full name': 'name',
        'e-mail': 'email',
        'phone number': 'phone',
        'ticket type': 'ticketTypeName',
        'ticket qty': 'ticketQty'
      };

      const result: ParsedRecipient[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted values if simple split isn't enough, but for now simple split
        // A robust regex for CSV split: /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));

        if (values.length < 2) continue; // Skip empty or invalid lines

        const recipient: any = {};
        
        headers.forEach((header, index) => {
           const mappedKey = headerMap[header];
           if (mappedKey && values[index] !== undefined) {
             recipient[mappedKey] = values[index];
           }
        });

        // Basic validation or default values
        if (recipient.name || recipient.email) {
            result.push({
                name: recipient.name || '',
                email: recipient.email || '',
                phone: recipient.phone || '',
                ticketTypeName: recipient.ticketTypeName || '',
                ticketQty: recipient.ticketQty || '0'
            });
        }
      }

      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
};
