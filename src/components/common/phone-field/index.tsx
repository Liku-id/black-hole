import { TextFieldProps, InputAdornment, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { Controller, useFormContext, RegisterOptions } from 'react-hook-form';

import { DropdownSelector } from '../dropdown-selector';
import { Body2 } from '../typography';

import { StyledTextField } from '../text-field/StyledTextField';

interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
}

const countryCodes: CountryCode[] = [
  { code: 'AF', dialCode: '+93', name: 'Afghanistan' },
  { code: 'AL', dialCode: '+355', name: 'Albania' },
  { code: 'DZ', dialCode: '+213', name: 'Algeria' },
  { code: 'AS', dialCode: '+1-684', name: 'American Samoa' },
  { code: 'AD', dialCode: '+376', name: 'Andorra' },
  { code: 'AO', dialCode: '+244', name: 'Angola' },
  { code: 'AR', dialCode: '+54', name: 'Argentina' },
  { code: 'AM', dialCode: '+374', name: 'Armenia' },
  { code: 'AU', dialCode: '+61', name: 'Australia' },
  { code: 'AT', dialCode: '+43', name: 'Austria' },
  { code: 'AZ', dialCode: '+994', name: 'Azerbaijan' },
  { code: 'BH', dialCode: '+973', name: 'Bahrain' },
  { code: 'BD', dialCode: '+880', name: 'Bangladesh' },
  { code: 'BY', dialCode: '+375', name: 'Belarus' },
  { code: 'BE', dialCode: '+32', name: 'Belgium' },
  { code: 'BZ', dialCode: '+501', name: 'Belize' },
  { code: 'BJ', dialCode: '+229', name: 'Benin' },
  { code: 'BT', dialCode: '+975', name: 'Bhutan' },
  { code: 'BO', dialCode: '+591', name: 'Bolivia' },
  { code: 'BA', dialCode: '+387', name: 'Bosnia and Herzegovina' },
  { code: 'BW', dialCode: '+267', name: 'Botswana' },
  { code: 'BR', dialCode: '+55', name: 'Brazil' },
  { code: 'BN', dialCode: '+673', name: 'Brunei' },
  { code: 'BG', dialCode: '+359', name: 'Bulgaria' },
  { code: 'BF', dialCode: '+226', name: 'Burkina Faso' },
  { code: 'BI', dialCode: '+257', name: 'Burundi' },
  { code: 'KH', dialCode: '+855', name: 'Cambodia' },
  { code: 'CM', dialCode: '+237', name: 'Cameroon' },
  { code: 'CA', dialCode: '+1', name: 'Canada' },
  { code: 'CV', dialCode: '+238', name: 'Cape Verde' },
  { code: 'CF', dialCode: '+236', name: 'Central African Republic' },
  { code: 'TD', dialCode: '+235', name: 'Chad' },
  { code: 'CL', dialCode: '+56', name: 'Chile' },
  { code: 'CN', dialCode: '+86', name: 'China' },
  { code: 'CO', dialCode: '+57', name: 'Colombia' },
  { code: 'KM', dialCode: '+269', name: 'Comoros' },
  { code: 'CG', dialCode: '+242', name: 'Congo' },
  { code: 'CR', dialCode: '+506', name: 'Costa Rica' },
  { code: 'HR', dialCode: '+385', name: 'Croatia' },
  { code: 'CU', dialCode: '+53', name: 'Cuba' },
  { code: 'CY', dialCode: '+357', name: 'Cyprus' },
  { code: 'CZ', dialCode: '+420', name: 'Czech Republic' },
  { code: 'DK', dialCode: '+45', name: 'Denmark' },
  { code: 'DJ', dialCode: '+253', name: 'Djibouti' },
  { code: 'EC', dialCode: '+593', name: 'Ecuador' },
  { code: 'EG', dialCode: '+20', name: 'Egypt' },
  { code: 'SV', dialCode: '+503', name: 'El Salvador' },
  { code: 'GQ', dialCode: '+240', name: 'Equatorial Guinea' },
  { code: 'ER', dialCode: '+291', name: 'Eritrea' },
  { code: 'EE', dialCode: '+372', name: 'Estonia' },
  { code: 'ET', dialCode: '+251', name: 'Ethiopia' },
  { code: 'FJ', dialCode: '+679', name: 'Fiji' },
  { code: 'FI', dialCode: '+358', name: 'Finland' },
  { code: 'FR', dialCode: '+33', name: 'France' },
  { code: 'GA', dialCode: '+241', name: 'Gabon' },
  { code: 'GM', dialCode: '+220', name: 'Gambia' },
  { code: 'GE', dialCode: '+995', name: 'Georgia' },
  { code: 'DE', dialCode: '+49', name: 'Germany' },
  { code: 'GH', dialCode: '+233', name: 'Ghana' },
  { code: 'GR', dialCode: '+30', name: 'Greece' },
  { code: 'GT', dialCode: '+502', name: 'Guatemala' },
  { code: 'GN', dialCode: '+224', name: 'Guinea' },
  { code: 'GW', dialCode: '+245', name: 'Guinea-Bissau' },
  { code: 'GY', dialCode: '+592', name: 'Guyana' },
  { code: 'HT', dialCode: '+509', name: 'Haiti' },
  { code: 'HN', dialCode: '+504', name: 'Honduras' },
  { code: 'HK', dialCode: '+852', name: 'Hong Kong' },
  { code: 'HU', dialCode: '+36', name: 'Hungary' },
  { code: 'IS', dialCode: '+354', name: 'Iceland' },
  { code: 'IN', dialCode: '+91', name: 'India' },
  { code: 'ID', dialCode: '+62', name: 'Indonesia' },
  { code: 'IR', dialCode: '+98', name: 'Iran' },
  { code: 'IQ', dialCode: '+964', name: 'Iraq' },
  { code: 'IE', dialCode: '+353', name: 'Ireland' },
  { code: 'IL', dialCode: '+972', name: 'Israel' },
  { code: 'IT', dialCode: '+39', name: 'Italy' },
  { code: 'JM', dialCode: '+1-876', name: 'Jamaica' },
  { code: 'JP', dialCode: '+81', name: 'Japan' },
  { code: 'JO', dialCode: '+962', name: 'Jordan' },
  { code: 'KZ', dialCode: '+7', name: 'Kazakhstan' },
  { code: 'KE', dialCode: '+254', name: 'Kenya' },
  { code: 'KW', dialCode: '+965', name: 'Kuwait' },
  { code: 'KG', dialCode: '+996', name: 'Kyrgyzstan' },
  { code: 'LA', dialCode: '+856', name: 'Laos' },
  { code: 'LV', dialCode: '+371', name: 'Latvia' },
  { code: 'LB', dialCode: '+961', name: 'Lebanon' },
  { code: 'LS', dialCode: '+266', name: 'Lesotho' },
  { code: 'LR', dialCode: '+231', name: 'Liberia' },
  { code: 'LY', dialCode: '+218', name: 'Libya' },
  { code: 'LI', dialCode: '+423', name: 'Liechtenstein' },
  { code: 'LT', dialCode: '+370', name: 'Lithuania' },
  { code: 'LU', dialCode: '+352', name: 'Luxembourg' },
  { code: 'MO', dialCode: '+853', name: 'Macau' },
  { code: 'MK', dialCode: '+389', name: 'Macedonia' },
  { code: 'MG', dialCode: '+261', name: 'Madagascar' },
  { code: 'MW', dialCode: '+265', name: 'Malawi' },
  { code: 'MY', dialCode: '+60', name: 'Malaysia' },
  { code: 'MV', dialCode: '+960', name: 'Maldives' },
  { code: 'ML', dialCode: '+223', name: 'Mali' },
  { code: 'MT', dialCode: '+356', name: 'Malta' },
  { code: 'MR', dialCode: '+222', name: 'Mauritania' },
  { code: 'MU', dialCode: '+230', name: 'Mauritius' },
  { code: 'MX', dialCode: '+52', name: 'Mexico' },
  { code: 'MD', dialCode: '+373', name: 'Moldova' },
  { code: 'MC', dialCode: '+377', name: 'Monaco' },
  { code: 'MN', dialCode: '+976', name: 'Mongolia' },
  { code: 'ME', dialCode: '+382', name: 'Montenegro' },
  { code: 'MA', dialCode: '+212', name: 'Morocco' },
  { code: 'MZ', dialCode: '+258', name: 'Mozambique' },
  { code: 'MM', dialCode: '+95', name: 'Myanmar' },
  { code: 'NA', dialCode: '+264', name: 'Namibia' },
  { code: 'NP', dialCode: '+977', name: 'Nepal' },
  { code: 'NL', dialCode: '+31', name: 'Netherlands' },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand' },
  { code: 'NI', dialCode: '+505', name: 'Nicaragua' },
  { code: 'NE', dialCode: '+227', name: 'Niger' },
  { code: 'NG', dialCode: '+234', name: 'Nigeria' },
  { code: 'NO', dialCode: '+47', name: 'Norway' },
  { code: 'OM', dialCode: '+968', name: 'Oman' },
  { code: 'PK', dialCode: '+92', name: 'Pakistan' },
  { code: 'PS', dialCode: '+970', name: 'Palestine' },
  { code: 'PA', dialCode: '+507', name: 'Panama' },
  { code: 'PG', dialCode: '+675', name: 'Papua New Guinea' },
  { code: 'PY', dialCode: '+595', name: 'Paraguay' },
  { code: 'PE', dialCode: '+51', name: 'Peru' },
  { code: 'PH', dialCode: '+63', name: 'Philippines' },
  { code: 'PL', dialCode: '+48', name: 'Poland' },
  { code: 'PT', dialCode: '+351', name: 'Portugal' },
  { code: 'PR', dialCode: '+1-787', name: 'Puerto Rico' },
  { code: 'QA', dialCode: '+974', name: 'Qatar' },
  { code: 'RO', dialCode: '+40', name: 'Romania' },
  { code: 'RU', dialCode: '+7', name: 'Russia' },
  { code: 'RW', dialCode: '+250', name: 'Rwanda' },
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia' },
  { code: 'SN', dialCode: '+221', name: 'Senegal' },
  { code: 'RS', dialCode: '+381', name: 'Serbia' },
  { code: 'SC', dialCode: '+248', name: 'Seychelles' },
  { code: 'SL', dialCode: '+232', name: 'Sierra Leone' },
  { code: 'SG', dialCode: '+65', name: 'Singapore' },
  { code: 'SK', dialCode: '+421', name: 'Slovakia' },
  { code: 'SI', dialCode: '+386', name: 'Slovenia' },
  { code: 'SO', dialCode: '+252', name: 'Somalia' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa' },
  { code: 'KR', dialCode: '+82', name: 'South Korea' },
  { code: 'SS', dialCode: '+211', name: 'South Sudan' },
  { code: 'ES', dialCode: '+34', name: 'Spain' },
  { code: 'LK', dialCode: '+94', name: 'Sri Lanka' },
  { code: 'SD', dialCode: '+249', name: 'Sudan' },
  { code: 'SR', dialCode: '+597', name: 'Suriname' },
  { code: 'SZ', dialCode: '+268', name: 'Swaziland' },
  { code: 'SE', dialCode: '+46', name: 'Sweden' },
  { code: 'CH', dialCode: '+41', name: 'Switzerland' },
  { code: 'SY', dialCode: '+963', name: 'Syria' },
  { code: 'TW', dialCode: '+886', name: 'Taiwan' },
  { code: 'TJ', dialCode: '+992', name: 'Tajikistan' },
  { code: 'TZ', dialCode: '+255', name: 'Tanzania' },
  { code: 'TH', dialCode: '+66', name: 'Thailand' },
  { code: 'TG', dialCode: '+228', name: 'Togo' },
  { code: 'TO', dialCode: '+676', name: 'Tonga' },
  { code: 'TN', dialCode: '+216', name: 'Tunisia' },
  { code: 'TR', dialCode: '+90', name: 'Turkey' },
  { code: 'TM', dialCode: '+993', name: 'Turkmenistan' },
  { code: 'UG', dialCode: '+256', name: 'Uganda' },
  { code: 'UA', dialCode: '+380', name: 'Ukraine' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom' },
  { code: 'US', dialCode: '+1', name: 'United States' },
  { code: 'UY', dialCode: '+598', name: 'Uruguay' },
  { code: 'UZ', dialCode: '+998', name: 'Uzbekistan' },
  { code: 'VU', dialCode: '+678', name: 'Vanuatu' },
  { code: 'VE', dialCode: '+58', name: 'Venezuela' },
  { code: 'VN', dialCode: '+84', name: 'Vietnam' },
  { code: 'YE', dialCode: '+967', name: 'Yemen' },
  { code: 'ZM', dialCode: '+260', name: 'Zambia' },
  { code: 'ZW', dialCode: '+263', name: 'Zimbabwe' }
];

// Convert to DropdownSelector format - created once outside component
const countryCodeOptions = countryCodes.map((country) => ({
  value: country.dialCode,
  label: `${country.dialCode} ${country.name}`,
  displayLabel: country.dialCode,
  id: country.code
}));

interface CustomPhoneFieldProps extends Omit<TextFieldProps, 'variant'> {
  label?: string;
  name: string; // Required for React Hook Form
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string;
  defaultCountryCode?: string;
}

export const CustomPhoneField = (props: CustomPhoneFieldProps) => {
  const {
    label,
    name,
    rules,
    error,
    helperText,
    defaultCountryCode = '+62',
    ...otherProps
  } = props;

  const {
    control,
    watch,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    trigger
  } = useFormContext();

  const fieldError = errors[name];
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(
    defaultCountryCode || '+62'
  );

  // Local state for display value (what user sees)
  const [displayValue, setDisplayValue] = useState<string>('');

  // Watch the form value to sync with displayValue (for edit mode)
  const formValue = watch(name);

  // Sync displayValue with form value when form value changes (for edit mode)
  useEffect(() => {
    if (formValue && typeof formValue === 'string' && formValue !== '') {
      // Find matching country code from the form value
      let detectedCountryCode = defaultCountryCode;
      let phoneWithoutCode = formValue;

      // Check if the value starts with a country code
      for (const country of countryCodes) {
        if (formValue.startsWith(country.dialCode)) {
          detectedCountryCode = country.dialCode;
          phoneWithoutCode = formValue.substring(country.dialCode.length).trim();
          break;
        }
      }

      // Update country code if different
      if (detectedCountryCode !== selectedCountryCode) {
        setSelectedCountryCode(detectedCountryCode);
      }

      // Update display value if different
      if (phoneWithoutCode && phoneWithoutCode !== displayValue) {
        setDisplayValue(phoneWithoutCode);
      }
    } else if (!formValue && displayValue) {
      setDisplayValue('');
    }
  }, [formValue]);

  // Handle phone number input change
  const handlePhoneNumberChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;

    // Prevent phone number from starting with 0
    if (inputValue.startsWith('0')) {
      // Set error manually to show user feedback
      setError(name, {
        type: 'manual',
        message: 'Phone number cannot start with 0'
      });
      return; // Don't update the value if it starts with 0
    }

    // Clear any existing errors when user types valid input
    clearErrors(name);

    setDisplayValue(inputValue);

    // Update the form value with country code only if there's input
    const combinedValue = inputValue ? selectedCountryCode + inputValue : '';
    setValue(name, combinedValue);

    // Trigger validation to clear error when user types
    await trigger(name);
  };

  // Initialize the field with empty value


  // Handle country code change
  const handleCountryCodeChange = async (newCountryCode: string) => {
    setSelectedCountryCode(newCountryCode);

    // Update the form value with new country code if there's input
    if (displayValue) {
      const combinedValue = newCountryCode + displayValue;
      setValue(name, combinedValue);
      await trigger(name);
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Box>
          {label && (
            <Body2 color="text.primary" display="block" mb={1}>
              {label}
            </Body2>
          )}
          <StyledTextField
            {...field}
            value={displayValue}
            error={!!fieldError}
            helperText={fieldError?.message as string}
            onChange={handlePhoneNumberChange}
            placeholder="Phone number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DropdownSelector
                    defaultLabel="+62"
                    options={countryCodeOptions}
                    selectedValue={selectedCountryCode}
                    onValueChange={handleCountryCodeChange}
                    enableSearch={true}
                  />
                </InputAdornment>
              )
            }}
            variant="outlined"
            {...otherProps}
          />
        </Box>
      )}
      rules={rules}
    />
  );
};

export default CustomPhoneField;
