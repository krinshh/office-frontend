'use client';

import React, {
  forwardRef, useState, useRef, useEffect,
  useCallback, useMemo, useId,
} from 'react';
import { createPortal } from 'react-dom';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Check from 'lucide-react/dist/esm/icons/check';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  ringVariant?: 'primary' | 'secondary' | 'warning' | 'destructive';
}

interface DropdownPos {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
}

const DROPDOWN_MAX_H = 320;
const GAP = 4;

const Select = React.memo(forwardRef<HTMLSelectElement, SelectProps>((
  { label, error, helperText, options, placeholder, fullWidth = true,
    ringVariant = 'primary',
    className = '', id, value, onChange, onBlur, disabled, name, ...props },
  ref,
) => {
  const autoId = useId();
  const selectId = id || autoId;

  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeRef = useRef<HTMLSelectElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // SSR guard — portal only after mount
  useEffect(() => { setMounted(true); }, []);

  // Forward ref
  useEffect(() => {
    if (!nativeRef.current) return;
    if (typeof ref === 'function') ref(nativeRef.current);
    else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = nativeRef.current;
  }, [ref]);

  const selectedOption = useMemo(
    () => options.find(o => String(o.value) === String(value)) ?? null,
    [options, value],
  );

  // ── Position ──────────────────────────────────────────────────────────────
  // Uses position:fixed + raw viewport coords — no scrollY math, works at any zoom
  const computePos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - GAP;
    const spaceAbove = r.top - GAP;
    const openUp = spaceBelow < 120 && spaceAbove > spaceBelow;
    const available = openUp ? spaceAbove : spaceBelow;
    const maxHeight = Math.min(DROPDOWN_MAX_H, Math.max(available, 80));
    setPos(
      openUp
        ? { bottom: window.innerHeight - r.top + GAP, left: r.left, width: r.width, maxHeight, openUp: true }
        : { top: r.bottom + GAP, left: r.left, width: r.width, maxHeight, openUp: false },
    );
  }, []);

  // Open → compute pos + set highlighted
  useEffect(() => {
    if (!isOpen) return;
    computePos();
    setHighlighted(options.findIndex(o => String(o.value) === String(value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Scroll highlighted item into view inside listbox
  useEffect(() => {
    if (!isOpen || !listboxRef.current) return;
    const idx = placeholder ? highlighted + 1 : highlighted;
    if (idx < 0) return;
    const el = listboxRef.current.children[idx] as HTMLElement | undefined;
    if (!el) return;
    const list = listboxRef.current;
    const elTop = el.offsetTop;
    const elBottom = el.offsetTop + el.offsetHeight;
    const listTop = list.scrollTop;
    const listBottom = list.scrollTop + list.clientHeight;
    if (elTop < listTop) {
      list.scrollTop = elTop;
    } else if (elBottom > listBottom) {
      list.scrollTop = elBottom - list.clientHeight;
    }
  }, [highlighted, isOpen, placeholder]);

  // ResizeObserver — recomputes width on any layout change (zoom, resize, font scale)
  useEffect(() => {
    if (!triggerRef.current) return;
    const ro = new ResizeObserver(() => { if (isOpen) computePos(); });
    ro.observe(triggerRef.current);
    return () => ro.disconnect();
  }, [isOpen, computePos]);

  // Close on outside click — delayed by one frame so the opening click doesn't
  // immediately re-trigger this handler
  useEffect(() => {
    if (!isOpen) return;
    let rafId: number;
    let cleanup: (() => void) | undefined;
    rafId = requestAnimationFrame(() => {
      const down = (e: MouseEvent) => {
        if (triggerRef.current?.contains(e.target as Node)) return;
        if (listboxRef.current?.contains(e.target as Node)) return;
        setIsOpen(false);
      };
      document.addEventListener('mousedown', down);
      cleanup = () => document.removeEventListener('mousedown', down);
    });
    return () => {
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, [isOpen]);

  // Scroll anywhere → close; resize → recompute
  // Delay attaching scroll listener by one frame so the open-click itself
  // doesn't immediately trigger it on browsers that scroll on focus
  useEffect(() => {
    if (!isOpen) return;
    let rafId: number;
    let cleanup: (() => void) | undefined;
    rafId = requestAnimationFrame(() => {
      const onScroll = (e: Event) => {
        // Ignore scrolls on the listbox itself or any child inside it
        if (listboxRef.current && (
          listboxRef.current === e.target ||
          listboxRef.current.contains(e.target as Node)
        )) return;
        setIsOpen(false);
      };
      const onResize = () => computePos();
      window.addEventListener('scroll', onScroll, { capture: true, passive: true });
      window.addEventListener('resize', onResize, { passive: true });
      cleanup = () => {
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onResize);
      };
    });
    return () => {
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, [isOpen, computePos]);

  // ── Change ────────────────────────────────────────────────────────────────
  const fireChange = useCallback((val: string) => {
    if (disabled || !nativeRef.current) return;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype, 'value',
    )?.set;
    setter?.call(nativeRef.current, val);
    nativeRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    onChange?.({
      target: nativeRef.current,
      currentTarget: nativeRef.current,
      type: 'change',
      bubbles: true,
      nativeEvent: new Event('change'),
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
  }, [onChange, disabled]);

  const pick = useCallback((val: string) => {
    fireChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [fireChange]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const cur = options.findIndex(o => String(o.value) === String(value));
        const next = e.key === 'ArrowDown'
          ? Math.min(cur + 1, options.length - 1)
          : Math.max(cur - 1, placeholder ? -1 : 0);
        fireChange(next === -1 ? '' : options[next].value);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(p => Math.min(p + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(p => Math.max(p - 1, placeholder ? -1 : 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlighted === -1 && placeholder) pick('');
      else if (highlighted >= 0) pick(options[highlighted].value);
      else setIsOpen(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  }, [disabled, isOpen, highlighted, options, value, placeholder, fireChange, pick]);

  // ── Classes ───────────────────────────────────────────────────────────────
  const ringClasses = {
    primary: 'focus:ring-primary/30',
    secondary: 'focus:ring-secondary/30',
    warning: 'focus:ring-warning/30',
    destructive: 'focus:ring-destructive/30',
  };

  const borderClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    warning: 'border-warning',
    destructive: 'border-destructive',
  };

  const textClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  const bgHoverClasses = {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary/10',
    warning: 'bg-warning/10',
    destructive: 'bg-destructive/10',
  };

  const borderHoverClasses = {
    primary: 'hover:border-primary/50',
    secondary: 'hover:border-secondary/50',
    warning: 'hover:border-warning/50',
    destructive: 'hover:border-destructive/50',
  };

  const ringActiveClasses = {
    primary: 'ring-2 ring-primary/30',
    secondary: 'ring-2 ring-secondary/30',
    warning: 'ring-2 ring-warning/30',
    destructive: 'ring-2 ring-destructive/30',
  };

  const triggerCls = [
    'flex h-10 w-full cursor-pointer select-none items-center gap-2',
    'rounded-md border bg-card px-3 py-2 text-sm shadow-sm',
    'transition-colors duration-150',
    'focus-visible:outline-none focus:ring-2',
    ringClasses[ringVariant],
    'disabled:cursor-not-allowed disabled:opacity-50 text-left',
    isOpen
      ? `${ringActiveClasses[ringVariant]} ${borderClasses[ringVariant]}`
      : error
        ? 'border-destructive/60 hover:border-destructive'
        : `border-input ${borderHoverClasses[ringVariant]}`,
    className,
  ].filter(Boolean).join(' ');

  // ── Dropdown (portal) ─────────────────────────────────────────────────────
  const dropdown = mounted && isOpen && pos ? createPortal(
    <ul
      ref={listboxRef}
      role="listbox"
      style={{
        position: 'fixed',
        ...(pos.openUp ? { bottom: pos.bottom } : { top: pos.top }),
        left: pos.left,
        width: pos.width,
        maxHeight: pos.maxHeight,
        zIndex: 9999,
      }}
      onWheel={e => {
        const el = listboxRef.current;
        if (!el) return;
        const atTop = el.scrollTop === 0 && e.deltaY < 0;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight && e.deltaY > 0;
        if (atTop || atBottom) e.stopPropagation();
      }}
      className={[
        'overflow-y-auto rounded-lg border border-border',
        'bg-card text-sm shadow-2xl outline-none no-scrollbar',
        'animate-in fade-in duration-100',
        pos.openUp ? 'slide-in-from-bottom-1' : 'slide-in-from-top-1',
      ].join(' ')}
    >
      {placeholder && (
        <li
          role="option"
          aria-selected={!value}
          onMouseDown={e => { e.preventDefault(); pick(''); }}
          onMouseEnter={() => setHighlighted(-1)}
          className={[
            'cursor-pointer select-none px-3 py-2 transition-colors',
            highlighted === -1
              ? `${bgHoverClasses[ringVariant]} ${textClasses[ringVariant]}`
              : 'text-muted-foreground hover:bg-muted',
          ].join(' ')}
        >
          {placeholder}
        </li>
      )}
      {options.map((opt, idx) => {
        const isSel = String(value) === String(opt.value);
        const isHigh = highlighted === idx;
        return (
          <li
            key={opt.value}
            role="option"
            aria-selected={isSel}
            aria-disabled={opt.disabled}
            onMouseDown={e => { e.preventDefault(); if (!opt.disabled) pick(opt.value); }}
            onMouseEnter={() => !opt.disabled && setHighlighted(idx)}
            className={[
              'relative cursor-pointer select-none px-3 py-2.5 transition-colors',
              isHigh ? `${bgHoverClasses[ringVariant]} ${textClasses[ringVariant]}` : 'text-foreground hover:bg-muted',
              isSel ? 'font-semibold' : '',
              opt.disabled ? 'cursor-not-allowed opacity-40' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className="block truncate pr-6">{opt.label}</span>
            {isSel && (
              <Check className={`absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${textClasses[ringVariant]}`} />
            )}
          </li>
        );
      })}
    </ul>,
    document.body,
  ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label
          id={`${selectId}-label`}
          htmlFor={`${selectId}-trigger`} // POINT TO THE VISIBLE TRIGGER
          className="block text-sm font-semibold text-foreground/80 mb-1.5 cursor-pointer select-none"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Native select — hidden, for form submit + ref only */}
        <select
          ref={nativeRef}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>

        {/* Visible trigger */}
        <button
          type="button"
          ref={triggerRef}
          id={`${selectId}-trigger`} // Unique ID for the visible component
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={props['aria-label']}
          aria-labelledby={label ? `${selectId}-label` : props['aria-labelledby']}
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(p => !p)}
          onKeyDown={handleKeyDown}
          onBlur={e => {
            if (onBlur && nativeRef.current) {
              onBlur({
                ...e,
                target: nativeRef.current,
                currentTarget: nativeRef.current,
              } as unknown as React.FocusEvent<HTMLSelectElement>);
            }
          }}
          className={triggerCls}
        >
          <span className={`flex-1 truncate ${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}>
            {selectedOption?.label ?? placeholder ?? ''}
          </span>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? `rotate-180 ${textClasses[ringVariant]}` : ''}`}
          />
        </button>
      </div>

      {dropdown}

      {error && (
        <p className="mt-1.5 text-xs text-destructive font-medium" role="alert">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground ml-0.5">{helperText}</p>
      )}
    </div>
  );
}));

Select.displayName = 'Select';
export default Select;
