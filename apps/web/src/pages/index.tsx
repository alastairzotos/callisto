import Head from 'next/head'
import React, { useEffect } from 'react';
import { Container, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { ListenButton } from '../components/listen-button';
import { Results } from '../components/results';
import { Logo } from '../components/logo';
import { Settings } from '../components/settings';

import { ConnectionStatusDisplay } from '../components/connection-status';
import { useCallisto, useSpeech } from '../state';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'black'
    }
  }
});

const App: React.FC = () => {
  const { configure: configureCallisto, createClient } = useCallisto();
  const { configure: configureSpeech } = useSpeech();

  useEffect(() => {
    if (typeof window !== undefined) {
      configureCallisto();
      createClient();
      configureSpeech();
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
        <Settings />

        <Container maxWidth="sm">
          <Logo />
          <Results />
        </Container>

        <ListenButton />
        <ConnectionStatusDisplay />
      </ThemeProvider>
    </div>
  );
}

export default App;
