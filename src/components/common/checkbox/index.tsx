import {
  Checkbox as MuiCheckbox,
  CheckboxProps,
  FormControlLabel,
  FormControlLabelProps
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled checkbox with custom padding and border radius
const StyledCheckbox = styled(MuiCheckbox)<CheckboxProps>(() => ({
  padding: 0,
  borderRadius: '4px',
  marginRight: '16px',
  '& .MuiSvgIcon-root': {
    fontSize: 20
  }
}));

interface CustomCheckboxProps extends Omit<CheckboxProps, 'label'> {
  label?: React.ReactNode;
  labelProps?: Omit<FormControlLabelProps, 'control' | 'label'>;
}

export const Checkbox = ({
  label,
  labelProps,
  ...checkboxProps
}: CustomCheckboxProps) => {
  if (label) {
    return (
      <FormControlLabel
        control={<StyledCheckbox {...checkboxProps} />}
        label={label}
        {...labelProps}
      />
    );
  }

  return <StyledCheckbox {...checkboxProps} />;
};

export default Checkbox;
