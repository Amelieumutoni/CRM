export default function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="lbl">{label}</div>
      <div className="val" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}