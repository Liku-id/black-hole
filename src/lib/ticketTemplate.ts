
export const ticketTemplate = (tickets: any[]) : string => {
  return `
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
          }

          .ticket-container {
            width: 605px;
            height: auto;
            min-height: 450px;
            padding: 32px;
            background: #ffffff;
            box-sizing: border-box;
            border: 1px solid #E2E8F0;
            margin-bottom: 20px;
          }

          .header {
            text-align: center;
            margin-bottom: 24px;
          }

          .event-title {
            font-size: 20px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 4px;
          }
          
          .organizer {
             font-size: 14px;
             color: #64748B;
          }

          .ticket-card {
            border: 0.5px solid #CBD5E1;
            border-radius: 14px;
            padding: 14px;
            margin-bottom: 24px;
          }

          .ticket-header {
            display: flex;
            align-items: center;
            border-left: 4px solid #3C50E0;
            height: 42px;
            padding-left: 12px;
            background-color: #F8FAFC;
            margin-bottom: 16px;
          }

          .ticket-type {
            font-size: 18px;
            font-weight: 700;
            color: #0F172A;
            text-transform: uppercase;
          }

          .divider {
            width: 100%;
            border-top: 1px dashed #CBD5E1;
            margin: 16px 0;
          }

          .content-grid {
            display: flex;
            gap: 24px;
          }

          .qr-section {
            width: 200px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .qr-code {
             width: 180px;
             height: 180px;
          }

          .info-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 16px;
          }

          .visitor-name {
            font-size: 22px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 8px;
          }

          .info-row {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
          }

          .info-text {
            font-size: 14px;
            color: #334155;
            font-weight: 400;
            line-height: 1.5;
          }
          
          .footer {
            text-align: center;
            margin-top: 10px;
          }
          
          .location-btn {
             display: inline-block;
             margin-top: 10px;
             padding: 4px 8px;
             border: 0.5px solid #000;
             background: white;
             font-size: 12px;
             text-decoration: none;
             color: black;
          }

        </style>
      </head>
      <body>
        ${tickets.map((ticket) => `
          <div class="ticket-container">
            <div class="header">
              <div class="event-title">${ticket.eventName || ''}</div>
              <div class="organizer">${ticket.eventOrganizerName || ''}</div>
            </div>

            <div class="ticket-card">
              <div class="ticket-header">
                <div class="ticket-type">${ticket.type || 'General Admission'}</div>
              </div>

              <div class="divider"></div>

              <div class="content-grid">
                <div class="qr-section">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qrValue}" class="qr-code" />
                </div>

                <div class="info-section">
                  <div class="visitor-name">${ticket.attendee}</div>

                  <div class="info-row">
                    <!-- Calendar Icon SVG -->
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 2V5" stroke="#64748B" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M16 2V5" stroke="#64748B" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M3.5 9.08984H20.5" stroke="#64748B" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#64748B" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="info-text">${ticket.date || ''}</div>
                  </div>

                  <div class="info-row">
                    <!-- Location Icon SVG -->
                    <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 13.43C13.7231 13.43 15.12 12.0331 15.12 10.31C15.12 8.58687 13.7231 7.19 12 7.19C10.2769 7.19 8.88 8.58687 8.88 10.31C8.88 12.0331 10.2769 13.43 12 13.43Z" stroke="#64748B" stroke-width="1.5" stroke-opacity="1"/>
                      <path d="M3.62 10.65C3.62 16.71 8.87 21.28 11.23 21.91C11.72 22.04 12.28 22.04 12.77 21.91C15.13 21.28 20.38 16.71 20.38 10.65C20.38 5.88 16.63 2 12 2C7.37 2 3.62 5.88 3.62 10.65Z" stroke="#64748B" stroke-width="1.5"/>
                    </svg>
                    <div class="info-text">${ticket.address || ''}</div>
                  </div>
                </div>
              </div>

               <div style="text-align: center; margin-top: 10px;">
                  <div style="font-size: 10px; color: #64748B;">Location Map</div>
                  <a href="${ticket.mapLocation || '#'}" style="font-size: 12px; color: #2563EB; text-decoration: underline; word-break: break-all; display: block;">${ticket.mapLocation || 'N/A'}</a>
               </div>
            </div>
          </div>
        `).join('')}
      </body>
    </html>
  `
}
