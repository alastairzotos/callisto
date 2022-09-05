import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SpeechResult, SpeechInputAdapter, SpeechOutputAdapter } from '@bitmetro/callisto';
import { CallistoClient } from '@bitmetro/callisto-client';

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
      // let ws: WebSocket;
      // const connect = async () => {
      //   ws = new WebSocket('ws://localhost:8080');
      
      //   ws.addEventListener('open', () => setConnectionStatus('connected'))
      
      //   ws.addEventListener('message', async ({ data }) => {
      //     setResponseText(data);
      //     await outputAdapter.speakResponse({ responseText: data })
      //   })
      
      //   ws.addEventListener('close', () => {
      //     setConnectionStatus('reconnecting');
      //     setTimeout(connect, 3000);
      //   })
      
      //   ws.addEventListener('error', () => {})
      // }
      
      // connect();

      const client = new CallistoClient({ host: 'ws://localhost:8080', retryTimeout: 3000 });
      
      const inputAdapter = new SpeechInputAdapter();
      inputAdapter.onResult.attach(async transcript => client.sendTranscript(transcript));

      const outputAdapter = new SpeechOutputAdapter();
      outputAdapter.onSpeaking.attach(setSpeechResult);

      setSpeechInputAdapter(inputAdapter);
      setSpeechOutputAdapter(outputAdapter);

      client.onMessage.attach(async ({ text }) => {
        setResponseText(text);
        await outputAdapter.speakResponse(text)
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
