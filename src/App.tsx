import React from 'react';
import { coreContext } from './contexts/core.context';
import { useCallisto } from './hooks/use-callisto.hook';
import { CallistoService } from './services/callisto.service';

const callisto = new CallistoService(coreContext);

callisto.addResponseListener(async (response) => window.speechSynthesis.speak(new SpeechSynthesisUtterance(response.responseText)))
callisto.addNoMatchListener(() => window.speechSynthesis.speak(new SpeechSynthesisUtterance("I don't understand")));

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
