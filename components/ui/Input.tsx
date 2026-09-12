'use client';

import React, { forwardRef } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'filled' | 'outlined';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: React.ReactNode;
  error?: string;
  label?: string;
  hint?: string;
  size?: InputSize;
  variant?: InputVariant;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  required?: boolean;
  success?: boolean;
}

const sizeConfigs: Record<InputSize, React.CSSProperties> = {
  sm: {
    padding: '8px 12px',
    fontSize: '12px',
    minHeight: '32px',
    gap: '6px',
  },

  md: {
    padding: '10px 16px',
    fontSize: '13px',
    minHeight: '40px',
    gap: '8px',
  },

  lg: {
    padding: '13px 20px',
    fontSize: '14px',
    minHeight: '48px',
    gap: '10px',
  },
};

const iconSizes: Record<InputSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

const variantConfigs: Record<InputVariant, React.CSSProperties> = {
  default: {
    background: 'var(--canvas)',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'var(--urban-fog)',
  },

  filled: {
    background: 'var(--cloud-veil)',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },

  outlined: {
    background: 'transparent',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'var(--charcoal-noir)',
  },
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      icon,
      error,
      label,
      hint,
      size = 'md',
      variant = 'default',
      clearable = false,
      onClear,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      required = false,
      success = false,
      className,
      style,
      id,
      disabled,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const generatedId = React.useId();
    const inputId = id || generatedId;

    /*
     * Container
     */
    const containerStyles: React.CSSProperties = {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    };

    /*
     * Label
     */
    const labelStyles: React.CSSProperties = {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--ironclad-grey)',
      marginBottom: '2px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    };

    /*
     * Input wrapper
     *
     * Important:
     * We use borderWidth, borderStyle and borderColor
     * separately instead of the border shorthand.
     *
     * This prevents React from warning when borderColor
     * changes between renders.
     */
    const inputWrapperStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',

      width: '100%',
      minWidth: 0,

      borderRadius: '30px',

      boxSizing: 'border-box',

      transition:
        'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out',

      ...variantConfigs[variant],
      ...sizeConfigs[size],

      ...(isFocused && {
        borderColor: 'var(--charcoal-noir)',
        boxShadow: '0 0 0 1px var(--charcoal-noir)',
      }),

      ...(error && {
        borderColor: '#ff4444',
        boxShadow: '0 0 0 1px #ff4444',
      }),

      ...(success && {
        borderColor: '#00cc66',
        boxShadow: '0 0 0 1px #00cc66',
      }),

      ...(disabled && {
        opacity: 0.5,
        cursor: 'not-allowed',
        background: 'var(--cloud-veil)',
      }),

      ...style,
    };

    /*
     * Input field
     */
    const inputStyles: React.CSSProperties = {
      borderWidth: 0,
      borderStyle: 'none',
      outline: 'none',

      background: 'transparent',

      flex: 1,
      width: '100%',
      minWidth: 0,

      padding: 0,
      margin: 0,

      fontFamily: 'var(--font-family-base)',
      fontSize: sizeConfigs[size].fontSize,
      lineHeight: 1,

      color: 'var(--charcoal-noir)',
    };

    /*
     * Icon
     */
    const iconStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',

      flexShrink: 0,

      color: error
        ? '#ff4444'
        : success
          ? '#00aa55'
          : 'var(--ironclad-grey)',
    };

    /*
     * Clear button
     */
    const clearButtonStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',

      width: '24px',
      height: '24px',

      padding: 0,

      background: 'none',

      borderWidth: 0,
      borderStyle: 'none',

      borderRadius: '50%',

      cursor: 'pointer',

      color: 'var(--urban-fog)',

      flexShrink: 0,

      transition: 'color 0.2s ease-in-out',
    };

    /*
     * Focus handler
     */
    const handleFocus = (
      event: React.FocusEvent<HTMLInputElement>
    ) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    /*
     * Blur handler
     */
    const handleBlur = (
      event: React.FocusEvent<HTMLInputElement>
    ) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    return (
      <div
        className={`input-container ${containerClassName}`}
        style={containerStyles}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`input-label ${labelClassName}`}
            style={labelStyles}
          >
            {label}

            {required && (
              <span
                style={{ color: '#ff4444' }}
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div
          className={[
            'input-wrapper',
            `input-${variant}`,
            `input-${size}`,
            error ? 'input-error' : '',
            success ? 'input-success' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={inputWrapperStyles}
        >
          {/* Leading icon */}
          {icon && (
            <span style={iconStyles}>
              {icon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={`input-field ${inputClassName}`}
            style={inputStyles}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            {...props}
          />

          {/* Clear button */}
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              style={clearButtonStyles}
              aria-label="Clear input"
              onMouseEnter={(event) => {
                event.currentTarget.style.color =
                  'var(--charcoal-noir)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color =
                  'var(--urban-fog)';
              }}
            >
              <X size={iconSizes[size] - 2} />
            </button>
          )}

          {/* Error icon */}
          {error && (
            <AlertCircle
              size={iconSizes[size]}
              style={{
                color: '#ff4444',
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <span
            id={`${inputId}-error`}
            className="input-error-message"
            style={{
              fontSize: '11px',
              color: '#ff4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            role="alert"
          >
            {error}
          </span>
        )}

        {/* Hint */}
        {hint && !error && (
          <span
            id={`${inputId}-hint`}
            className="input-hint"
            style={{
              fontSize: '11px',
              color: 'var(--ironclad-grey)',
            }}
          >
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export type {
  InputSize,
  InputVariant,
  InputProps,
};

export default Input;