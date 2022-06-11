import React from 'react';
import { useCallisto } from './hooks/use-callisto.hook';
import { funnyPlugin } from './plugins/funny.plugin';
import { weatherPlugin } from './plugins/weather.plugin';
import { wikipediaPlugin } from './plugins/wikipedia.plugin';
import { CallistoService } from './callisto/callisto';
import { speak } from './utils/speech';

const callisto = new CallistoService();

callisto.applyPlugins(weatherPlugin, wikipediaPlugin, funnyPlugin)

callisto.addResponseListener(async response => await speak(response.responseText))
callisto.addNoMatchListener(async () => await speak("Sorry, I don't understand."))

const App: React.FC = () => {
  const { listening, interim, result, loading, noMatch, response } = useCallisto(callisto);

  return (
    <>
      <button
        onMouseDown={() => callisto.startRecognition()}
        onMouseUp={() => callisto.stopRecognition()}
        onTouchStart={() => callisto.startRecognition()}
        onTouchEnd={() => callisto.stopRecognition()}
      >
        { listening ? 'Listening' : 'Listen' }
      </button>
      <br />

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
