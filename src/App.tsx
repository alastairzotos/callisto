import React from 'react';
import { Manager } from './components/manager.component';
import { coreContext } from './contexts/core.context';
import { CallistoService } from './services/callisto.service';

const App: React.FC = () => {
  const callisto: CallistoService = new CallistoService(coreContext);

  callisto.onResponse(async (response) => {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(response.responseText));
  })

  callisto.onNoMatch(() => window.speechSynthesis.speak(new SpeechSynthesisUtterance("I don't understand")));

  return <Manager callisto={callisto} />;
}

export default App;
