import React from 'react';
import { Button, Checkbox, Dialog, IconButton, Switch } from '@radix-ui/themes';
import { AccessibilityIcon, Cross2Icon, ResetIcon } from '@radix-ui/react-icons';
import { NEEDS } from '../../place-tools.mjs';

export default function NeedsFilter({ needs, onChange, open, onOpenChange }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>

    <Dialog.Content className="needs-dialog" maxWidth="440px">
      <div className="sheet-heading"><Dialog.Title>My needs</Dialog.Title><Dialog.Close><IconButton variant="ghost" color="gray" aria-label="Close needs"><Cross2Icon /></IconButton></Dialog.Close></div>
      <Dialog.Description>Choose the facilities you need. All selected facilities must be reported as available; unknown, limited and negative reports are excluded.</Dialog.Description>
      <div className="needs-options">{NEEDS.map(need => <label key={need.id}><Checkbox size="3" checked={needs.ids.includes(need.id)} onCheckedChange={checked => onChange({ ids: checked ? [...needs.ids, need.id] : needs.ids.filter(id => id !== need.id), enabled: checked || needs.ids.length > 1 })} />{need.label}</label>)}</div>
      <label className="needs-switch"><span>Use my needs</span><Switch checked={needs.enabled} onCheckedChange={enabled => onChange({ ...needs, enabled })} /></label>
      <p className="form-note">Saved on this browser. Reported availability is not an on-site guarantee.</p>
      <div className="sheet-actions"><Button variant="ghost" color="gray" onClick={() => onChange({ ids: [], enabled: false })}><ResetIcon />Clear needs</Button><Dialog.Close><Button>Show places</Button></Dialog.Close></div>
    </Dialog.Content>
  </Dialog.Root>;
}
