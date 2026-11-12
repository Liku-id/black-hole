import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import TimeField from './index';

describe('TimeField', () => {
  it('renders initial state', () => {
    render(
      <TimeField label="Select Time" value="10:30" onChange={jest.fn()} />
    );
    expect(screen.getByText('Select Time')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });

  it('increments and decrements hours and minutes', () => {
    const handleChange = jest.fn();
    render(
      <TimeField label="Select Time" value="10:30" onChange={handleChange} />
    );

    const upIcons = screen.getAllByTestId('KeyboardArrowUpIcon');
    const downIcons = screen.getAllByTestId('KeyboardArrowDownIcon');

    fireEvent.click(upIcons[0].closest('button')!);
    expect(handleChange).toHaveBeenLastCalledWith('11:30');

    fireEvent.click(downIcons[0].closest('button')!);
    expect(handleChange).toHaveBeenLastCalledWith('10:30');

    fireEvent.click(upIcons[1].closest('button')!);
    expect(handleChange).toHaveBeenLastCalledWith('10:31');

    fireEvent.click(downIcons[1].closest('button')!);
    expect(handleChange).toHaveBeenLastCalledWith('10:30');
  });

  it('wraps around 00/23 hours and 00/59 minutes', () => {
    const handleChange = jest.fn();
    render(<TimeField value="00:00" onChange={handleChange} />);

    const upIcons = screen.getAllByTestId('KeyboardArrowUpIcon');
    const downIcons = screen.getAllByTestId('KeyboardArrowDownIcon');

    fireEvent.click(downIcons[0].closest('button')!);
    expect(handleChange).toHaveBeenLastCalledWith('23:00');

    fireEvent.click(upIcons[0].closest('button')!);
    expect(handleChange).toHaveBeenLastCalledWith('00:00');

    fireEvent.click(downIcons[1].closest('button')!);
    expect(handleChange).toHaveBeenLastCalledWith('00:59');

    fireEvent.click(upIcons[1].closest('button')!);
    expect(handleChange).toHaveBeenLastCalledWith('00:00');
  });

  it('validates direct input for hours and minutes and handles blur/focus', () => {
    const handleChange = jest.fn();
    render(
      <TimeField label="Start Time" value="09:15" onChange={handleChange} />
    );

    const [hoursInput, minutesInput] = screen.getAllByRole('textbox');
    // hoursInput/minutesInput are inside adornment; query by display value
    const hInput = screen.getByDisplayValue('09') as HTMLInputElement;
    const mInput = screen.getByDisplayValue('15') as HTMLInputElement;

    fireEvent.focus(hInput);
    fireEvent.change(hInput, { target: { value: '25' } });
    expect(screen.getByText('Hours must be 0-23')).toBeInTheDocument();

    fireEvent.change(hInput, { target: { value: '' } });
    fireEvent.blur(hInput);

    fireEvent.change(hInput, { target: { value: '14' } });
    expect(handleChange).toHaveBeenLastCalledWith('14:15');
    fireEvent.blur(hInput);

    fireEvent.focus(mInput);
    fireEvent.change(mInput, { target: { value: '75' } });
    expect(screen.getByText('Minutes must be 0-59')).toBeInTheDocument();

    fireEvent.change(mInput, { target: { value: '' } });
    fireEvent.blur(mInput);

    fireEvent.change(mInput, { target: { value: '45' } });
    expect(handleChange).toHaveBeenLastCalledWith('14:45');
    fireEvent.blur(mInput);

    expect(hoursInput).toBeDefined();
    expect(minutesInput).toBeDefined();
  });

  it('works with React Hook Form when name is provided', () => {
    const Wrapper = () => {
      const methods = useForm({ defaultValues: { eventTime: '08:05' } });
      return (
        <FormProvider {...methods}>
          <TimeField label="Event Time" name="eventTime" />
        </FormProvider>
      );
    };

    render(<Wrapper />);
    expect(screen.getByText('Event Time')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08')).toBeInTheDocument();
    expect(screen.getByDisplayValue('05')).toBeInTheDocument();

    const upIcons = screen.getAllByTestId('KeyboardArrowUpIcon');
    fireEvent.click(upIcons[0].closest('button')!);
    expect(screen.getByDisplayValue('09')).toBeInTheDocument();
  });

  it('handles empty/invalid initial value in React Hook Form mode', () => {
    const Wrapper = () => {
      const methods = useForm({ defaultValues: { eventTime: 'bad:val' } });
      return (
        <FormProvider {...methods}>
          <TimeField name="eventTime" />
        </FormProvider>
      );
    };

    render(<Wrapper />);
    const upIcons = screen.getAllByTestId('KeyboardArrowUpIcon');
    fireEvent.click(upIcons[0].closest('button')!);
    expect(screen.getByDisplayValue('01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('00')).toBeInTheDocument();
  });
});
