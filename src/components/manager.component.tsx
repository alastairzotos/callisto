import React from 'react';
import { useCallisto } from '../hooks/use-callisto.hook';
import { CallistoService } from '../services/callisto.service';

interface Props {
  callisto: CallistoService;
  interimComponent?: React.FC<{ transcript: string }>;
  resultComponent?: React.FC<{ transcript: string }>;
  loadingComponent?: React.FC;
  noMatchComponent?: React.FC;
  responseComponent?: React.FC<{ response: string }>;
}

export const Manager: React.FC<Props> = ({
  callisto,
  interimComponent = ({ transcript }) => <samp>{transcript}</samp>,
  resultComponent = ({ transcript }) => <samp>{'>'} {transcript}</samp>,
  loadingComponent = () => <p>...</p>,
  noMatchComponent = () => <p>No match</p>,
  responseComponent = ({ response }) => <p>{response}</p>,
}) => {
  const { interim, result, loading, noMatch, response } = useCallisto(callisto);

  return (
    <>
      {
        result
          ? resultComponent({ transcript: result })
          : interimComponent({ transcript: interim })
      }

      {loading && loadingComponent({})}
      {noMatch && noMatchComponent({})}
      {response && responseComponent({ response })}
    </>
  );
}
