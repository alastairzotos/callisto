import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SpeechResult, SpeechInputAdapter, SpeechOutputAdapter } from '@bitmetro/callisto';
import { CallistoBrowserClient } from '@bitmetro/callisto-client';

import { ListenButton } from '../src/components/listen-button';
import { Results } from '../src/components/results';
import { Logo } from '../src/components/logo';
import { Settings } from '../src/components/settings';

import { ConnectionStatus } from '../src/models';
import { ConnectionStatusDisplay } from '../src/components/connection-status';
import { env } from '../env';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'black'
    }
  }
});

const knownServers: { [name: string]: string } = {
  bitmetro: 'wss://callisto-server.bitmetro.io',
  localhost: 'ws://localhost:8080'
}

const App: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')

  const [speechInputAdapter, setSpeechInputAdapter] = useState<SpeechInputAdapter | null>(null);
  const [speechOutputAdapter, setSpeechOutputAdapter] = useState<SpeechOutputAdapter | null>(null);

  const [speechResult, setSpeechResult] = useState<SpeechResult | undefined>(undefined);
  const [prompts, setPrompts] = useState<string[]>([]);

  const [selectedServerName, setSelectedServerName] = useState<string | undefined>();

  const [listening, setListening] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [interim, setInterim] = useState('');
  const [speechResultText, setSpeechResultText] = useState('');

  useEffect(() => {
    if (!!selectedServerName) {
      if (typeof window !== undefined) {
        const client = new CallistoBrowserClient({ host: knownServers[selectedServerName], retryTimeout: 3000 });

        setResponseText('');
        setInterim('');
        setSpeechResultText('');

        let inputAdapter = speechInputAdapter;
        let outputAdapter = speechOutputAdapter;

        if (!inputAdapter && !outputAdapter) {
          inputAdapter = new SpeechInputAdapter();
          inputAdapter.onListening.attach(setListening);
          inputAdapter.onResult.attach(async transcript => client.sendTranscript(transcript));

          inputAdapter.onInterim.attach(setInterim);
          inputAdapter.onResult.attach(async result => setSpeechResultText(result));
          inputAdapter.onListening.attach(listening => {
            if (listening) {
              setSpeechResultText('');
            }
            setResponseText('')
          })

          outputAdapter = new SpeechOutputAdapter();
          outputAdapter.onSpeaking.attach(setSpeechResult);

          setSpeechInputAdapter(inputAdapter);
          setSpeechOutputAdapter(outputAdapter);
        }

        client.onMessage.attach(async ({ type, error, text, prompts }) => {
          if (type === 'message') {
            if (error) {
              setResponseText(`Sorry, I don't understand`);
              await outputAdapter?.speakResponse(`Sorry, I don't understand`);
            } else if (text) {
              setResponseText(text);
              await outputAdapter?.speakResponse(text);
            }
          } else {
            setPrompts(prompts);
          }
        })

        client.onConnected.attach(() => setConnectionStatus('connected'));

        client.onClose.attach(() => setConnectionStatus('reconnecting'));

        client.connect();
      }
    } else {

    }
  }, [selectedServerName])

  return (
    <div>
      <Head>
        <title>Callisto | BitMetro</title>
        <meta name="description" content="A simple virtual assistant framework for TypeScript" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Settings
          selectedServer={selectedServerName}
          knownServers={knownServers}
          onSelectServer={setSelectedServerName}
        />

        <Container maxWidth="sm">
          <div style={{ height: 'calc(100vh - 200px)', padding: 20 }}>
            <Logo />
            {(!!speechInputAdapter && !!speechOutputAdapter) && (
              <Results
                interim={interim}
                speechResultText={speechResultText}
                responseText={responseText}
              />
            )}
          </div>

          <ListenButton
            disconnected={connectionStatus !== 'connected'}
            listening={listening}
            onStart={() => speechInputAdapter?.startRecognition()}
            speaking={!!speechResult}
            onCancel={() => {
              speechResult?.cancel();
              setSpeechResult(undefined);
            }}
            prompts={prompts}
          />
        </Container>

        <ConnectionStatusDisplay serverName={selectedServerName} status={connectionStatus} />
      </ThemeProvider>
    </div>
  );
}

export default App;
