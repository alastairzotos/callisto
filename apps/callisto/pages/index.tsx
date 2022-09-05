import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CallistoService, SpeechResult, SpeechInputAdapter, SpeechOutputAdapter } from '@bitmetro/callisto';

import { ListenButton } from '../src/components/listen-button';
import { Results } from '../src/components/results';
import { Logo } from '../src/components/logo';

import { weatherPlugin } from '../src/plugins/weather.plugin';
import { wikipediaPlugin } from '../src/plugins/wikipedia.plugin';
import { jokesPlugin } from '../src/plugins/jokes.plugin';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

const App: React.FC = () => {
  const [speechResponse, setSpeechResponse] = useState<SpeechResult | null>(null);
  const [speechInputAdapter, setSpeechInputAdapter] = useState<SpeechInputAdapter | null>(null);
  const [speechOutputAdapter, setSpeechOutputAdapter] = useState<SpeechOutputAdapter | null>(null);

  useEffect(() => {
    if (typeof window !== undefined) {
      const callisto = new CallistoService();
      callisto.applyPlugins(weatherPlugin, wikipediaPlugin, jokesPlugin)

      const inputAdapter = new SpeechInputAdapter()
      callisto.registerInputAdapter(inputAdapter);

      const outputAdapter = new SpeechOutputAdapter();
      callisto.registerOutputAdapter(outputAdapter);
      outputAdapter.onSpeaking(setSpeechResponse);

      setSpeechInputAdapter(inputAdapter);
      setSpeechOutputAdapter(outputAdapter);
    }
  }, [])

  return (
    <div>
      <Head>
        <title>Callisto | BitMetro</title>
        <meta name="description" content="A simple virtual assistant framework for TypeScript" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />

        {(!!speechInputAdapter && !!speechOutputAdapter) && (
          <Container maxWidth="sm">
            <div style={{ height: 'calc(100vh - 180px)', padding: 20 }}>
              <Logo />
              <Results speechInputAdapter={speechInputAdapter} />
            </div>

            <ListenButton speechInputAdapter={speechInputAdapter} onCancel={() => speechResponse?.cancel()} />
          </Container>
        )}
      </ThemeProvider>
    </div>
  );
}

export default App;
