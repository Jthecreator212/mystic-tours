// Form component prop types
import { ReactNode } from 'react';

// Base form props
export interface BaseFormProps {
  onSubmit?: (data: unknown) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

// Input field props
export interface InputFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'time' | 'url';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Select field props
export interface SelectFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  multiple?: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Textarea field props
export interface TextareaFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
}

// Checkbox field props
export interface CheckboxFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

// Radio group props
export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Date picker props
export interface DatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

// Time picker props
export interface TimePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  minTime?: string;
  maxTime?: string;
  step?: number;
}

// File upload props
export interface FileUploadProps {
  name: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  onUpload?: (files: File[]) => void | Promise<void>;
}

// Form validation props
export interface FormValidationProps {
  schema?: unknown; // Zod schema
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  criteriaMode?: 'firstError' | 'allValidations';
}

// Form submission props
export interface FormSubmissionProps {
  onSubmit?: (data: unknown) => void | Promise<void>;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  loading?: boolean;
  disabled?: boolean;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

// Form field wrapper props
export interface FormFieldWrapperProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  children: ReactNode;
}

// Form section props
export interface FormSectionProps {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

// Form grid props
export interface FormGridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
} 