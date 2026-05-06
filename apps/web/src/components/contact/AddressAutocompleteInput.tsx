'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/shared/Icon';
import {
  getGeoapifyAutocompleteUrl,
  toAddressSuggestion,
  type AddressSuggestion,
  type GeoapifyAddressResult,
} from '@/lib/address-autocomplete';

type Props = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  required?: boolean;
  maxLength?: number;
};

type FetchStatus = 'idle' | 'loading' | 'ready' | 'error';

const MIN_QUERY_LENGTH = 3;
const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '';

export function AddressAutocompleteInput({
  id,
  name,
  value,
  onChange,
  className,
  required,
  maxLength,
}: Props) {
  const listboxId = useId();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ignoreBlurRef = useRef(false);
  const trimmedValue = value.trim();

  const canSearch = GEOAPIFY_API_KEY.length > 0 && trimmedValue.length >= MIN_QUERY_LENGTH;
  const showList = open && suggestions.length > 0;

  useEffect(() => {
    if (!canSearch) {
      setSuggestions([]);
      setStatus('idle');
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setStatus('loading');
      try {
        const response = await fetch(getGeoapifyAutocompleteUrl(trimmedValue, GEOAPIFY_API_KEY), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Geoapify ${response.status}`);
        const data = (await response.json()) as { results?: GeoapifyAddressResult[] };
        const next = (data.results ?? [])
          .map(toAddressSuggestion)
          .filter((suggestion): suggestion is AddressSuggestion => Boolean(suggestion));
        setSuggestions(dedupeSuggestions(next));
        setStatus('ready');
        setActiveIndex(-1);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setSuggestions([]);
        setStatus('error');
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [canSearch, trimmedValue]);

  const activeDescendant = useMemo(() => {
    if (!showList || activeIndex < 0) return undefined;
    return `${listboxId}-${activeIndex}`;
  }, [activeIndex, listboxId, showList]);

  function selectSuggestion(suggestion: AddressSuggestion) {
    onChange(suggestion.address);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[activeIndex];
      if (selected) selectSuggestion(selected);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          autoComplete="street-address"
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => {
              if (ignoreBlurRef.current) {
                ignoreBlurRef.current = false;
                return;
              }
              setOpen(false);
              setActiveIndex(-1);
            }, 100);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          className={`${className} pr-10`}
        />
        {status === 'loading' ? (
          <Icon
            name="LoaderCircle"
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-muted"
          />
        ) : (
          <Icon
            name="MapPin"
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
        )}
      </div>

      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-surface py-1 text-sm shadow-lg"
          onMouseDown={() => {
            ignoreBlurRef.current = true;
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id} id={`${listboxId}-${index}`} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={`flex w-full items-start gap-2 px-3 py-2 text-left transition-colors ${
                  index === activeIndex ? 'bg-surface-alt text-ink' : 'text-ink hover:bg-surface-alt'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuggestion(suggestion)}
              >
                <Icon name="MapPin" size={15} className="mt-0.5 shrink-0 text-brand" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{suggestion.primary}</span>
                  {suggestion.secondary ? (
                    <span className="block truncate text-xs text-ink-muted">{suggestion.secondary}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {status === 'error' ? (
        <span className="mt-1 block text-xs text-ink-muted">Keep typing the address manually.</span>
      ) : null}
    </div>
  );
}

function dedupeSuggestions(suggestions: AddressSuggestion[]): AddressSuggestion[] {
  const seen = new Set<string>();
  return suggestions.filter((suggestion) => {
    const key = suggestion.address.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
