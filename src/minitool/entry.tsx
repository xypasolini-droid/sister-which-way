import { createRoot } from 'react-dom/client';
import SisterGame from '../components/SisterGame';
import { installCompatibility } from './compat';
import { prepareRuntime } from './platform';
import { installImageRecovery } from './image-recovery';
import '../app/globals.css';
import './minitool.css';

installCompatibility();
void prepareRuntime().then(() => {
  const container = document.getElementById('root');
  if (container) { installImageRecovery(container); createRoot(container).render(<SisterGame/>); }
}).catch(() => {
  const container = document.getElementById('root');
  if (container) container.textContent = '故事暂时没能打开，请退出后重新进入。';
});
