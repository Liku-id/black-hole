import * as commonExports from './index';

describe('common components barrel exports', () => {
  it('exports all common components and table styled primitives', () => {
    expect(commonExports.Button).toBeDefined();
    expect(commonExports.Card).toBeDefined();
    expect(commonExports.DateField).toBeDefined();
    expect(commonExports.DropdownSelector).toBeDefined();
    expect(commonExports.Modal).toBeDefined();
    expect(commonExports.Popup).toBeDefined();
    expect(commonExports.PhoneField).toBeDefined();
    expect(commonExports.Select).toBeDefined();
    expect(commonExports.Tabs).toBeDefined();
    expect(commonExports.TextField).toBeDefined();
    expect(commonExports.TextArea).toBeDefined();
    expect(commonExports.TimeField).toBeDefined();
    expect(commonExports.Typography).toBeDefined();
    expect(commonExports.Body1).toBeDefined();
    expect(commonExports.Body2).toBeDefined();
    expect(commonExports.Caption).toBeDefined();
    expect(commonExports.H1).toBeDefined();
    expect(commonExports.H2).toBeDefined();
    expect(commonExports.H3).toBeDefined();
    expect(commonExports.H4).toBeDefined();
    expect(commonExports.Overline).toBeDefined();
    expect(commonExports.Accordion).toBeDefined();
    expect(commonExports.Checkbox).toBeDefined();
    expect(commonExports.Breadcrumb).toBeDefined();
    expect(commonExports.Dropzone).toBeDefined();
    expect(commonExports.AutoComplete).toBeDefined();
    expect(commonExports.MultiSelect).toBeDefined();
    expect(commonExports.Pagination).toBeDefined();
    expect(commonExports.StyledTableContainer).toBeDefined();
    expect(commonExports.StyledTableHead).toBeDefined();
    expect(commonExports.StyledTableBody).toBeDefined();
    expect(commonExports.CollapsibleCardList).toBeDefined();
    expect(commonExports.QRCode).toBeDefined();
  });
});
