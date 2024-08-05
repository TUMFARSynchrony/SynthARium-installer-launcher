import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('syntharium', (arg) => {
  // eslint-disable-next-line no-console
  console.log('[INFO] IPCRenderer ran with following arguments:', arg);
});
