import express, { Application } from 'express';

import Server from './src/index';
import Logger from "./src/lib/logger";

/*eslint @typescript-eslint/no-unused-vars: "off"*/

const app: Application = express();
const server: Server = new Server(app);
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app
    .listen(PORT, () => {
        Logger.debug(`Server is running on port ${PORT}.`);
    })
    .on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
            Logger.error('Error: address already in use');
        } else {
            Logger.error(err);
        }
    });
