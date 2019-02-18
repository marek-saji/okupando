import './lib/cli-env';
import { values as args } from './lib/args-definitions';
import app from './lib/express';
import { monitorStatus } from './lib/push';


monitorStatus();

app.listen(args.HTTP_PORT, args.HOST, () => {
    console.log(
        'HTTP',
        'Listening on',
        `http://${args.HOST}:${args.PORT}`
    );
});
