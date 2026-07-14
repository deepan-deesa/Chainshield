import morgan from 'morgan';
import { Request } from 'express';
import { RepositoryFactory } from '../repositories/factory';

// Custom morgan format matching professional secure server logs
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

export const httpLogger = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      const cleanMessage = message.trim();
      console.log(`[ACCESS] ${cleanMessage}`);

      // Parse and asynchronously write trace logs to database telemetry logs
      try {
        const parts = cleanMessage.split(' ');
        const method = parts[0];
        const url = parts[1];
        const status = parseInt(parts[2], 10);

        if (status && status >= 400) {
          const systemLogRepo = RepositoryFactory.getSystemLogRepository();
          systemLogRepo.create({
            level: status >= 500 ? 'ERROR' : 'WARN',
            message: `API Route [${method}] ${url} returned response status ${status}`,
            meta: JSON.stringify({ httpMessage: cleanMessage })
          }).catch(() => {});
        }
      } catch (err) {
        // Prevent logger issues from interrupting actual request threads
      }
    }
  }
});
