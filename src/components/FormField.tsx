'use client';

import React from 'react';
import Input from './Input';

interface FormFieldProps extends React.ComponentProps<typeof Input> {
  name: string;
  label: string;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  id,
  required = false,
  error,
  ...inputProps
}) => {
  const inputId = id || name;
  return (
    <div>
      <Input
        {...inputProps}
        id={inputId}
        name={name}
        label={
          <span>
            {label}
            {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </span>
        }
        error={error}
        aria-required={required}
      />
    </div>
  );
};

export default FormField;