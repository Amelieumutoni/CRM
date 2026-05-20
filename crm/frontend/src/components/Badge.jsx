export default function Badge({ label, type = 'stage' }) {
  if (!label) return null;
  const cls = type === 'priority'
    ? `badge p-${label}`
    : `badge s-${label.replace(/ /g, '-')}`;
  return <span className={cls}>{label}</span>;
}