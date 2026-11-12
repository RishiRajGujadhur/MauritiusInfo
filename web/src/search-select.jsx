import React, { useId, useMemo, useState } from 'react';
import { Button, Popover, TextField } from '@radix-ui/themes';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { fold } from '../../data-core.mjs';

export default function SearchSelect({ label, icon: Icon, value, options, onChange, placeholder, allowAll = true, getOptionIcon }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const id = useId();
  const choices = useMemo(() => allowAll ? [['', placeholder], ...options] : options, [options, placeholder, allowAll]);
  const matches = choices.filter(([, text]) => fold(text).includes(fold(query)));
  const selected = choices.find(([key]) => key === value)?.[1] || placeholder;
  const TriggerIcon = (value && getOptionIcon?.(value)) || Icon;
  const activeIndex = Math.min(active, Math.max(0, matches.length - 1));

  function choose(next) {
    onChange(next);
    setOpen(false);
  }
  function navigate(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + direction + matches.length) % (matches.length || 1));
    }
    if (event.key === 'Enter' && matches[activeIndex]) {
      event.preventDefault();
      choose(matches[activeIndex][0]);
    }
    if (event.key === 'Home' && event.ctrlKey) { event.preventDefault(); setActive(0); }
    if (event.key === 'End' && event.ctrlKey) { event.preventDefault(); setActive(matches.length - 1); }
  }

  return <div className="filter-control" data-selected={Boolean(value && allowAll)}>
    <Popover.Root open={open} onOpenChange={next => { setOpen(next); if (next) { setQuery(''); setActive(0); } }}>
      <Popover.Trigger><Button variant={value && allowAll ? 'soft' : 'surface'} color={value && allowAll ? 'blue' : 'gray'} className="filter-trigger" aria-label={`${label}: ${selected}`}>
        <TriggerIcon /><span className="filter-caption">{label}</span><span className="filter-value">{value && allowAll ? `${label} · ${selected}` : selected}</span><ChevronDownIcon className="chevron" />
      </Button></Popover.Trigger>
      <Popover.Content className="search-popover" sideOffset={7} align="start" aria-label={`Choose ${label.toLowerCase()}`}>
        <TextField.Root autoFocus size="2" role="combobox" aria-label={`Search ${label.toLowerCase()}`} aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-options`} aria-activedescendant={matches.length ? `${id}-${activeIndex}` : undefined} value={query} placeholder={`Search ${label.toLowerCase()}…`} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={navigate}>
          <TextField.Slot><MagnifyingGlassIcon /></TextField.Slot>
        </TextField.Root>
        <div className="option-list" id={`${id}-options`} role="listbox" aria-label={label}>
          {matches.map(([key, text], index) => {
            const OptionIcon = key && getOptionIcon?.(key);
            return <Button key={key} id={`${id}-${index}`} role="option" tabIndex={-1} aria-selected={key === value} variant="ghost" color="gray" className={`search-option ${index === activeIndex ? 'is-active' : ''}`} onMouseEnter={() => setActive(index)} onClick={() => choose(key)} ref={node => { if (node && index === activeIndex) node.scrollIntoView({ block: 'nearest' }); }}>
            <span className="option-label">{OptionIcon && <OptionIcon aria-hidden="true" />}{text}</span>{key === value && <CheckIcon />}
          </Button>;
          })}
          {!matches.length && <p className="no-options">No matches</p>}
        </div>
        <div className="menu-hint"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>Enter</kbd> select <kbd>Esc</kbd> close</div>
      </Popover.Content>
    </Popover.Root>
  </div>;
}
