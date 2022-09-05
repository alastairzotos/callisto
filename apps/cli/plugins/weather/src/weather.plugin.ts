import { onReceiveArgs, sendResponse, sendQuestion } from '@bitmetro/callisto-ipc';
import { getWeather } from './get-weather';

onReceiveArgs(async ([time = 'today', location]) => {
  if (!location) {
    return sendQuestion('Where do you live?', async answer => {
      sendResponse(await getWeather(time, answer))
    });
  }

  sendResponse(await getWeather(time, location))
})
