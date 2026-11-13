import React from 'react';
import { Badge, Tooltip } from '@radix-ui/themes';
import { CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, QuestionMarkCircledIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { humanize, status } from '../../data-core.mjs';

export function ReportBadge({ value }) {
  const report = typeof value === 'object' ? value : status(value);
  const color = { positive: 'green', limited: 'amber', negative: 'red', unknown: 'gray' }[report.group];
  const Icon = { positive: CheckCircledIcon, limited: ExclamationTriangleIcon, negative: CrossCircledIcon, unknown: QuestionMarkCircledIcon, InfoCircledIcon }[report.group];
  const text = { positive: 'Reported yes', limited: 'Limited', negative: 'Reported no', unknown: 'Unknown' }[report.group];
  return <Tooltip content={`Source value · ${humanize(report.raw)}`}><Badge color={color} variant="soft" className="report-badge"><Icon />{text}</Badge></Tooltip>;
}


export function EvidenceLabels({ record }) {
  return <span className="evidence-labels">{record.evidenceIncomplete ? <Tooltip content="Some evidence tables did not load. Retry loading before drawing conclusions."><Badge color="amber" variant="soft">Evidence unavailable</Badge></Tooltip> : (record.evidence || []).map(item => <Tooltip key={item.id} content={item.description}><Badge variant="outline" color={item.id === 'onsite' ? 'green' : 'gray'}><InfoCircledIcon />{item.label}</Badge></Tooltip>)}</span>;
}
