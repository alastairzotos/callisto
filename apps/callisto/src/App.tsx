import React, { useCallback, useEffect, useState } from 'react';
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CallistoService, speak, SpeechResult } from '@bitmetro/callisto';

import { funnyPlugin } from './plugins/funny.plugin';
import { weatherPlugin } from './plugins/weather.plugin';
import { wikipediaPlugin } from './plugins/wikipedia.plugin';
import { jokesPlugin } from './plugins/jokes.plugin';
import { ListenButton } from './components/listen-button';
import { Results } from './components/results';
import { Logo } from './components/logo';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

const callisto = new CallistoService();
callisto.applyPlugins(weatherPlugin, wikipediaPlugin, jokesPlugin, funnyPlugin)

const App: React.FC = () => {
  const [speechResponse, setSpeechResponse] = useState<SpeechResult | null>(null);

  useEffect(() => {
    callisto.addNoMatchListener(async () => await handleResponse("Sorry, I don't understand."))
    callisto.addResponseListener(async response => await handleResponse(response.responseText))
  }, [])

  const handleResponse = useCallback(async (text: string) => {
    const result = speak(text);
    setSpeechResponse(result);
    await result.promise;
  }, [])

  const handleCancelClick = () => {
    if (speechResponse) {
      speechResponse.cancel();
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Container maxWidth="sm">
        <div style={{ height: 'calc(100vh - 180px)', padding: 20 }}>
          <Logo />
          <Results callisto={callisto} />
        </div>

        <div>
          <ListenButton callisto={callisto} onCancel={handleCancelClick} />
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default App;
