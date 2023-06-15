import { NextPage } from 'next';
import Error from 'next/error';

interface Props {
  statusCode?: number;
}

const Page: NextPage<Props> = ({ statusCode }) => {
  return <Error statusCode={statusCode!}></Error>;
}

Page.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Page;
