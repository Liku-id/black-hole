export interface Event {
  id: string;
  name: string;
  type: string;
  event_organizer_name: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface EventListResponse {
  statusCode: number;
  message: string;
  body: {
    events: Event[];
  };
}

export interface EventErrorDetail {
  '@type': string;
  additionalProp1?: string;
  additionalProp2?: string;
  additionalProp3?: string;
}

export interface EventErrorResponse {
  code: number;
  message: string;
  details: EventErrorDetail[];
}
