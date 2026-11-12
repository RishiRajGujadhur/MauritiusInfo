import { Badge, Link, Tooltip } from '@radix-ui/themes';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { humanize, safeURL, status } from '../../data-core.mjs';

export function ReportBadge({ value }) {
  const report = typeof value === 'object' ? value : status(value);
  const color = { positive: 'green', limited: 'amber', negative: 'red', unknown: 'gray' }[report.group];
  return <Tooltip content={`Source value · ${humanize(report.raw)}`}><Badge color={color} variant="soft">{report.label}</Badge></Tooltip>;
}

export function SourceLink({ url, children }) {
  const href = safeURL(url);
  return href ? <Link href={href} target="_blank" rel="noopener noreferrer">{children} <ExternalLinkIcon /></Link> : null;
}

