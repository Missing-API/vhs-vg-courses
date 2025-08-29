import { Level } from 'pino';

interface LogLevelConfig {
  app: string;
  level: Level;
}

export const logLevelConfig: LogLevelConfig[] = [
  {
    app: '*',
    level: 'debug',
  },
];
