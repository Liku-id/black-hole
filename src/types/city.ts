export interface City {
  id: string;
  name: string;
}

export interface CitiesResponse {
  message: string;
  body: City[];
}
