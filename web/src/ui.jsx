import React from 'react';
import { Badge, Tooltip } from '@radix-ui/themes';
import { CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { humanize, status } from '../../data-core.mjs';

export function ReportBadge({ value }) {
  const report = typeof value === 'object' ? value : status(value);
  const color = { positive: 'green', limited: 'amber', negative: 'red', unknown: 'gray' }[report.group];
  const Icon = { positive: CheckCircledIcon, limited: ExclamationTriangleIcon, negative: CrossCircledIcon, unknown: QuestionMarkCircledIcon }[report.group];
  const text = { positive: 'Reported yes', limited: 'Limited', negative: 'Reported no', unknown: 'Unknown' }[report.group];
  return <Tooltip content={`Source value · ${humanize(report.raw)}`}><Badge color={color} variant="soft" className="report-badge"><Icon />{text}</Badge></Tooltip>;
}

