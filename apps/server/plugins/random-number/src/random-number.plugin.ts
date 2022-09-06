import { onInteraction } from '../../libs/callisto-plugin';

onInteraction('random-number', async () => `${ Math.round(Math.random() * 99) + 1 }`);
onInteraction('another', async () => `${ Math.round(Math.random() * 99) + 1 }`);
