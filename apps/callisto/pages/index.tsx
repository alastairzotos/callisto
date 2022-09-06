import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SpeechResult, SpeechInputAdapter, SpeechOutputAdapter } from '@bitmetro/callisto';
import { CallistoClientBrowser } from '@bitmetro/callisto-client';

import { ListenButton } from '../src/components/listen-button';
import { Results } from '../src/components/results';
import { Logo } from '../src/components/logo';

import { ConnectionStatus } from '../src/models';
import { ConnectionStatusDisplay } from '../src/components/connection-status';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

const App: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')

  const [speechInputAdapter, setSpeechInputAdapter] = useState<SpeechInputAdapter | null>(null);
  const [speechOutputAdapter, setSpeechOutputAdapter] = useState<SpeechOutputAdapter | null>(null);

  const [speechResult, setSpeechResult] = useState<SpeechResult | undefined>(undefined);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (typeof window !== undefined) {
      const client = new CallistoClientBrowser({ host: 'ws://localhost:8080', retryTimeout: 3000 });

      const inputAdapter = new SpeechInputAdapter();
      inputAdapter.onResult.attach(async transcript => client.sendTranscript(transcript));

      const outputAdapter = new SpeechOutputAdapter();
      outputAdapter.onSpeaking.attach(setSpeechResult);

      setSpeechInputAdapter(inputAdapter);
      setSpeechOutputAdapter(outputAdapter);

      client.onMessage.attach(async ({ error, text }) => {
        if (error) {
          setResponseText('No match');
          await outputAdapter.speakResponse(`Sorry, I don't understand`);
        } else {
          setResponseText(text);
          await outputAdapter.speakResponse(text);
        }
      })

      client.onConnected.attach(() => setConnectionStatus('connected'));

      client.connect();
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
              <Results speechInputAdapter={speechInputAdapter} responseText={responseText} />
            </div>

            <ListenButton
              speechResult={speechResult}
              prompts={['TODO']}
              speechInputAdapter={speechInputAdapter}
            />

            <ConnectionStatusDisplay status={connectionStatus} />
          </Container>
        )}
      </ThemeProvider>
    </div>
  );
}

export default App;
