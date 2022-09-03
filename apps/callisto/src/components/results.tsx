import React from 'react';
import { LinearProgress, Typography, styled } from '@mui/material';
import { CallistoService } from '@bitmetro/callisto';

import { useCallisto } from '../hooks/use-callisto.hook';

interface Props {
  callisto: CallistoService;
}

const Wrapper = styled('div')(() => ({
  paddingTop: 100,
}))

const Response = styled(Typography)(() => ({
  fontFamily: 'monospace'
}))

const ResponseWrapper = styled('div')(() => ({
  display: 'flex'
}))

const ResponseColumn = styled('div')(() => ({
  width: '90%'
}))

export const Results: React.FC<Props> = ({ callisto }) => {
  const { interim, result, loading, noMatch, response } = useCallisto(callisto);

  return (
    <Wrapper>
      {
        result
          ? <Typography>{'>'} {result}</Typography>
          : <Typography>{interim}</Typography>
      }

      {loading && <LinearProgress />}

      <>
        {noMatch && <Response>No match</Response>}
        {response && <Response>{response}</Response>}
      </>
    </Wrapper>
  )
}
