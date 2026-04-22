export const ticketTemplate = (tickets: any[]) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Endgame | What's Your Endgame?</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Onest:wght@400;600&display=swap" rel="stylesheet">
  <!-- (Tailwind dipakai untuk reset util kecil; style utama di CSS custom) -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Onest:wght@400;600&display=swap');

    :root{
      --text-color:#111;
      --muted-text:#374151;
      --border-color:#000;
      --divider-color:#e5e7eb;
      --bg:#ffffff;
    }

    *{ box-sizing:border-box; }

    body{
      font-family:'Onest',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
      background:var(--bg);
      color:var(--text-color);
      margin:0;
      padding:0;
    }

    .title{
      font-family:'Bebas Neue',Impact,'Arial Black',sans-serif;
    }

    .ticket-card{
      border:1px solid var(--border-color);
      background:#fff;
      padding:1rem;
      margin:2rem auto;
      max-width:605px;
      width:100%;
      page-break-after: always;
    }

    .vvip-label{
      color:var(--text-color);
      font-weight:600;
      font-size:18px;
      margin-bottom:16px;
      text-transform:uppercase;
      height:24px;
      line-height:24px;
    }

    .qr-img{
      width:200px;height:200px;object-fit:contain;margin-right:1.5rem;flex:0 0 200px;
    }

    /* ROW ICON + TEXT */
    .info-row{
      display:flex;
      align-items:center;        /* default: center */
      gap:0.5rem;
      min-height:24px;
      margin-bottom:1rem;
    }
    .info-row.location{
      align-items:flex-start;    /* alamat bisa multi-line */
    }

    .info-icon{
      width:24px;height:24px;display:block;flex:0 0 24px;
    }

    .info-text{
      font-size:14px;
      color:var(--muted-text);
      line-height:24px;
      font-family:'Onest',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
    }

    /* >>> TWEAK MARGIN untuk penyelarasan ekstra <<< */
    .info-text--date{  margin-top:2px; }  /* turunkan sedikit teks tanggal */
    .info-text--addr{  margin-top:2px; }  /* kecil untuk alamat multi-line */
    /* Kalau masih belum pas di device tertentu, ubah nilai 1–3px saja. */

    .divider{ border-top:1px solid var(--divider-color); margin:1.5rem 0; }
  </style>
</head>
<body class="bg-white min-h-screen flex flex-col items-center justify-start">
  ${tickets
    .map(
      (ticket, idx) => `
    <div class="ticket-card">
      <div class="text-center uppercase mb-4 tracking-wide title" style="font-size:22px;">
        ${ticket.eventOrganizerName} | ${ticket.eventName}
      </div>

      <div class="vvip-label">
        ${ticket.type} #${idx + 1}
      </div>

      <svg xmlns="http://www.w3.org/2000/svg" width="547" height="2" viewBox="0 0 547 2" fill="none" aria-hidden="true">
        <path d="M0 1H547" stroke="#585C71" stroke-width="0.5" stroke-dasharray="4 4"/>
      </svg>

      <div class="flex mt-4">
        <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qrValue)}" alt="QR Code">

        <div>
          <div class="mb-4 title uppercase" style="font-size:22px;">${ticket.attendee}</div>

          <!-- Tanggal: center + teks diturunkan 2px -->
          <div class="info-row">
            <svg class="info-icon" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16.5 12C17.3284 12 18 12.6716 18 13.5C18 14.3284 17.3284 15 16.5 15C15.6716 15 15 14.3284 15 13.5C15 12.6716 15.6716 12 16.5 12Z" fill="black"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8 2C8.55228 2 9 2.44772 9 3H15C15 2.44772 15.4477 2 16 2H17C17.5523 2 18 2.44772 18 3H19C20.6569 3 22 4.34315 22 6L21.9961 19.1543C21.9961 20.5 20.5 21.9961 19.1543 21.9961L17.5 22H8L4.8457 21.9961C3.5 21.9961 2.00391 20.5 2.00391 19.1543L2 6C2 4.34315 3 3 5 3H6C6 2.44772 6.44772 2 7 2H8ZM4 19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V10H4V19Z" fill="black"/>
            </svg>
            <span class="info-text info-text--date">${ticket.date}</span>
          </div>

          <!-- Alamat: icon top, teks diberi margin kecil -->
          <div class="info-row location">
            <svg class="info-icon" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C16.4182 2 19.9999 5.65691 20 10.168C20 14.6978 15.7277 18.7055 12.7119 21.7051C12.3163 22.0986 11.6837 22.0986 11.2881 21.7051C8.27233 18.7056 4 14.6985 4 10.168C4.00008 5.65691 7.58177 2 12 2ZM12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6Z" fill="black"/>
            </svg>
            <span class="info-text info-text--addr">${ticket.address}</span>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
