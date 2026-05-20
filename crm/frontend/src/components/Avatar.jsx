import { avatarColor } from '../utils/helpers';
export default function Avatar({ name = '', size = 36 }) {
  const c = avatarColor(name);
  return (
    <div className="avatar" style={{ width: size, height: size, background: c.bg, color: c.text, fontSize: size * 0.36 }}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}