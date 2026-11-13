import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, IconButton, Popover, TextField } from '@radix-ui/themes';
import { CheckIcon, Cross2Icon, ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { fold } from '../../data-core.mjs';

export default function SearchSelect({ label, icon: Icon, value, options, onChange, placeholder, allowAll = true, getOptionIcon }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [limit,setLimit]=useState(100);
  const id = useId();
  const pointerOpen = useRef(false);
  const contentRef = useRef(null);
  const searchRef = useRef(null);
  const optionRefs = useRef([]);
  const choices = useMemo(() => allowAll ? [['', placeholder], ...options] : options, [options, placeholder, allowAll]);
  const matchedChoices = choices.filter(([, text]) => fold(text).includes(fold(query)));
  const matches = matchedChoices.slice(0,limit);
  const selected = choices.find(([key]) => key === value)?.[1] || placeholder;
  const TriggerIcon = (value && getOptionIcon?.(value)) || Icon;
  const activeIndex = Math.min(active, Math.max(0, matches.length - 1));

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, query]);

  function choose(next) {
    onChange(next);
    setOpen(false);
  }
  function navigate(event) {
    if(event.nativeEvent.isComposing||event.target.closest?.('[data-menu-action]'))return;
    if(event.key==='PageDown'||event.key==='PageUp'){event.preventDefault();setActive(Math.max(0,Math.min(matches.length-1,activeIndex+(event.key==='PageDown'?10:-10))));return;}
    if(event.target!==searchRef.current&&event.key.length===1&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&event.key!==' '){event.preventDefault();setQuery(query+event.key);setActive(0);searchRef.current?.focus();return;}

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + direction + matches.length) % (matches.length || 1));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if(matches[activeIndex])choose(matches[activeIndex][0]);
    }
    if (event.key === 'Home' && event.ctrlKey) { event.preventDefault(); setActive(0); }
    if (event.key === 'End' && event.ctrlKey) { event.preventDefault(); setActive(matches.length - 1); }
  }

  return <div className="filter-control" data-selected={Boolean(value && allowAll)}>
    <Popover.Root open={open} onOpenChange={next => { setOpen(next); if (next) { setQuery(''); const selectedIndex=Math.max(0,choices.findIndex(([key])=>key===value));setLimit(Math.max(100,selectedIndex+1));setActive(selectedIndex); } }}>
      <Popover.Trigger><Button type="button" variant={value && allowAll ? 'soft' : 'surface'} color={value && allowAll ? 'blue' : 'gray'} className="filter-trigger" onPointerDown={() => { pointerOpen.current = true; }} onKeyDown={() => { pointerOpen.current = false; }} title={`${label}: ${selected}`} aria-label={`${label}: ${selected}`}>
        <TriggerIcon /><span className="filter-caption">{label}</span><span className="filter-value">{value && allowAll ? `${label} · ${selected}` : selected}</span><ChevronDownIcon className="chevron" />
      </Button></Popover.Trigger>
      <Popover.Content ref={contentRef} tabIndex={-1} onKeyDown={navigate} onOpenAutoFocus={event => { event.preventDefault(); if (pointerOpen.current) contentRef.current?.focus({ preventScroll: true }); else searchRef.current?.focus({ preventScroll: true }); }} className="search-popover" sideOffset={7} align="start" aria-label={`Choose ${label.toLowerCase()}`}>
        <TextField.Root ref={searchRef} className="dropdown-search" size="2" autoComplete="off" autoCorrect="off" spellCheck={false} role="combobox" aria-label={`Search ${label.toLowerCase()}`} aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-options`} aria-activedescendant={matches.length ? `${id}-${activeIndex}` : undefined} value={query} placeholder={`Search ${label.toLowerCase()}…`} onChange={event => { setQuery(event.target.value); setActive(0);setLimit(100); }}>
          <TextField.Slot><MagnifyingGlassIcon /></TextField.Slot>{query&&<TextField.Slot side="right"><IconButton data-menu-action type="button" variant="ghost" color="gray" aria-label={`Clear ${label.toLowerCase()} search`} onClick={()=>{setQuery('');setActive(0);searchRef.current?.focus();}}><Cross2Icon /></IconButton></TextField.Slot>}
        </TextField.Root>
        <p className="menu-count" role="status">{matchedChoices.length} options · showing {matches.length}</p>
        <div className="option-list" id={`${id}-options`} role="listbox" aria-label={label}>
          {matches.map(([key, text], index) => {
            const OptionIcon = key && getOptionIcon?.(key);
            return <Button type="button" key={key} id={`${id}-${index}`} role="option" tabIndex={-1} aria-selected={key === value} variant="ghost" color="gray" className={`search-option ${index === activeIndex ? 'is-active' : ''}`} onMouseEnter={() => setActive(index)} onClick={() => choose(key)} ref={node => { optionRefs.current[index] = node; }}>
            <span className="option-label">{OptionIcon && <OptionIcon aria-hidden="true" />}{text}</span>{key === value && <CheckIcon />}
          </Button>;
          })}
          {!matches.length&&<div className="no-options"><p>No matches</p><Button data-menu-action type="button" variant="soft" onClick={()=>{setQuery('');setActive(0);searchRef.current?.focus();}}>Clear search</Button></div>}{matchedChoices.length>matches.length&&<Button data-menu-action type="button" variant="soft" onClick={()=>setLimit(value=>value+100)}>Show 100 more options</Button>}
        </div>
        <div className="menu-hint"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>Enter</kbd> select <kbd>Esc</kbd> close</div>
      </Popover.Content>
    </Popover.Root>
  </div>;
}
