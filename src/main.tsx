import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Make sure a previously installed service worker can never serve a stale build.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.update());
    }).catch(() => {});
  });
}
