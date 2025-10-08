import { useState } from 'react';

interface UseExportTicketsReturn {
  exportTickets: (eventId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useExportTickets = (): UseExportTicketsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportTickets = async (eventId: string) => {
    if (loading) return;

    // Validate
    if (!eventId) {
      const err = 'Event ID is required for ticket export';
      setError(err);
      throw new Error(err);
    }

    setLoading(true);
    setError(null);

    try {
      const url = `/api/tickets-export?event_id=${eventId}`;

      const response = await fetch(url, {
        method: 'GET'
      });

      if (!response.ok) {
        let errorMessage = `Export failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'tickets_export.csv';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob and download
      const blob = await response.blob();

      // Download file
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
    } catch (err: any) {
      setError(err?.message || 'Failed to export tickets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    exportTickets,
    loading,
    error
  };
};
