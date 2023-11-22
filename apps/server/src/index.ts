import { CallistoServer } from '@bitmetro/callisto-server';
import * as path from 'path';

const pluginsRoot = process.env.NODE_ENV === 'production' ? '/plugins' : path.resolve(__dirname, '..', 'plugins');

const server = new CallistoServer({ pluginsRoot });

server.start();
