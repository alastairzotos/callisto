import React from 'react';
import { rootContext } from './contexts/context';
import { useCallisto } from './hooks/use-callisto.hook';
import { funnyPlugin } from './plugins/funny.plugin';
import { weatherPlugin } from './plugins/weather.plugin';
import { wikipediaPlugin } from './plugins/wikipedia.plugin';
import { CallistoService } from './services/callisto.service';
import { speak } from './utils/speech';

const callisto = new CallistoService(rootContext);

callisto.applyPlugins([weatherPlugin, wikipediaPlugin, funnyPlugin])

callisto.addResponseListener(async response => await speak(response.responseText))
callisto.addNoMatchListener(async () => await speak('Sorry, I don\'t understand.'))


const App: React.FC = () => {
  const { interim, result, loading, noMatch, response } = useCallisto(callisto);

  return (
    <>
      {
        result
          ? <samp>{'>'} {result}</samp>
          : <samp>{interim}</samp>
      }

      {loading && <samp>...</samp>}
      {noMatch && <p>No match</p>}
      {response && <p>{response}</p>}
    </>
  );
}

export default App;
