import React from 'react';
import { coreContext } from './contexts/core.context';
import { useCallisto } from './hooks/use-callisto.hook';
import { CallistoService } from './services/callisto.service';

const callisto = new CallistoService(coreContext);

callisto.addResponseListener((response) => new Promise((resolve) => {
  const utterance = new SpeechSynthesisUtterance(response.responseText);
  utterance.onend = () => resolve();
  window.speechSynthesis.speak(utterance)
}))

callisto.addNoMatchListener(() => new Promise((resolve) => {
  const utterance = new SpeechSynthesisUtterance("I don't understand");
  utterance.onend = () => resolve();
  window.speechSynthesis.speak(utterance)
}))

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
