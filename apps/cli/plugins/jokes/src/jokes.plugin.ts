import { sendCallistoResponse } from '@bitmetro/callisto-ipc';
import { getJoke } from './get-joke';

const start = async () => {
  sendCallistoResponse(await getJoke());
}

start();
