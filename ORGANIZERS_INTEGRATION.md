# Event Organizers Integration

This document describes the implementation of the Event Organizers feature with API backend integration.

## Features

- **Paginated Table**: Display organizers in a table with pagination support
- **Real-time Data**: Uses SWR for data fetching with automatic revalidation
- **Error Handling**: Proper error handling with user-friendly messages
- **Loading States**: Loading indicators while fetching data
- **Responsive Design**: Mobile-friendly table layout

## API Integration

### Endpoint
- **URL**: `/event-organizers`
- **Method**: `GET`
- **Response Format**:
```json
{
  "message": "success",
  "body": {
    "eventOrganizers": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone_number": "string",
        "bank_information": {
          "bank": {
            "name": "string",
            "logo": "string"
          },
          "accountNumber": "string",
          "accountHolderName": "string"
        },
        "nik": "string",
        "npwp": "string",
        "created_at": "string",
        "updated_at": "string"
      }
    ]
  }
}
```

## Configuration

1. Copy `.env.local.example` to `.env.local`
2. Update `BACKEND_URL` to point to your backend API
3. Ensure your backend API supports CORS for the frontend domain

## File Structure

```
pages/
  organizers/
    index.tsx           # Main organizers page
  api/
    event-organizers.ts # API proxy endpoint

src/
  components/
    OrganizersTable/
      index.tsx         # Organizers table component
  hooks/
    useOrganizers.ts    # SWR hook for data fetching
  services/
    organizersService.ts # API service
  types/
    organizer.ts        # TypeScript types
```

## Usage

1. Navigate to `/organizers` in your application
2. The page will automatically load organizers from the API
3. Use the refresh button to manually reload data
4. Table supports pagination and sorting

## Error Handling

- Network errors are displayed as alerts
- Loading states are shown during API calls
- Empty states are handled gracefully
- Retry logic is built into the SWR hook

## Future Enhancements

- Add organizer creation/editing
- Implement organizer filtering
- Add bulk operations
- Export organizer data
- Add organizer profile views
