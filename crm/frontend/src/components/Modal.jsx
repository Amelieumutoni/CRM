export default function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: 18, padding: '2px 8px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}