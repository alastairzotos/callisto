import { CallistoServer } from '@bitmetro/callisto-server';
import * as path from 'path';

const server = new CallistoServer({
  pluginsRoot: path.resolve(__dirname, '..', 'plugins')
});

server.start();
