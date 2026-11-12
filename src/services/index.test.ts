import {
  assetsService,
  authService,
  discountsService,
  eventOrganizerService,
  eventsService,
  eventTypesService,
  forgotPasswordService,
  listService,
  partnersService,
  ticketsService,
  transactionsService,
  utmService,
  withdrawalService
} from './index';

describe('services barrel exports', () => {
  it('exports all service instances', () => {
    expect(eventsService).toBeDefined();
    expect(eventTypesService).toBeDefined();
    expect(ticketsService).toBeDefined();
    expect(transactionsService).toBeDefined();
    expect(eventOrganizerService).toBeDefined();
    expect(authService).toBeDefined();
    expect(forgotPasswordService).toBeDefined();
    expect(listService).toBeDefined();
    expect(assetsService).toBeDefined();
    expect(withdrawalService).toBeDefined();
    expect(utmService).toBeDefined();
    expect(partnersService).toBeDefined();
    expect(discountsService).toBeDefined();
  });
});
