import { getCallistoArgs, sendCallistoResponse } from '@bitmetro/callisto-ipc';
import { getWeather } from './get-weather';

const start = async () => {
  const { argv } = getCallistoArgs();
  const [time = 'today', location] = argv;

  if (!location) {
    sendCallistoResponse('Where are you asking about?', { location: null });
  }

  sendCallistoResponse(await getWeather(time, location));
}

start();
