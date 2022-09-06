import { onInteraction } from '@bitmetro/callisto-ipc';

onInteraction('random-number', async () => `${ Math.round(Math.random() * 99) + 1 }`);
