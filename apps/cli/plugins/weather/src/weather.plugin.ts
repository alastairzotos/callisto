import { onInteraction, sendQuestion } from '@bitmetro/callisto-ipc';
import { getWeather } from './get-weather';

onInteraction('with-location', async ([time = 'today', location]) => await getWeather(time, location))

onInteraction('no-location', ([time = 'today']) => new Promise<string>((resolve) => {
  sendQuestion('Where do you live?', async location => resolve(await getWeather(time, location)))
}))
