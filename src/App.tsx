import React from 'react';
import { Button, Container, CssBaseline, LinearProgress, Typography } from '@mui/material';

import { useCallisto } from './hooks/use-callisto.hook';
import { funnyPlugin } from './plugins/funny.plugin';
import { weatherPlugin } from './plugins/weather.plugin';
import { wikipediaPlugin } from './plugins/wikipedia.plugin';
import { CallistoService } from './callisto/callisto';
import { speak } from './utils/speech';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { jokesPlugin } from './plugins/jokes.plugin';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

const callisto = new CallistoService();

callisto.applyPlugins(weatherPlugin, wikipediaPlugin, jokesPlugin, funnyPlugin)

callisto.addResponseListener(async response => await speak(response.responseText))
callisto.addNoMatchListener(async () => await speak("Sorry, I don't understand."))

const App: React.FC = () => {
  const { enabled, listening, interim, result, loading, noMatch, response } = useCallisto(callisto);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Container maxWidth="sm">
        <div style={{ height: '50vh', padding: 20 }}>
          {
            result
              ? <Typography>{'>'} {result}</Typography>
              : <Typography>{interim}</Typography>
          }

          {loading && <LinearProgress />}
          {noMatch && <Typography>No match</Typography>}
          {response && <Typography>{response}</Typography>}
        </div>

        <div>
          <Button
            style={{ padding: 20, width: '100%' }}
            variant="contained"
            onMouseDown={() => callisto.startRecognition()}
            onMouseUp={() => callisto.stopRecognition()}
            onTouchStart={() => callisto.startRecognition()}
            onTouchEnd={() => callisto.stopRecognition()}
            disabled={!enabled}
          >
            {listening ? 'Listening' : 'Listen'}
          </Button>
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default App;
