import { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);
  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  );
}
export const useApp = () => useContext(Ctx);