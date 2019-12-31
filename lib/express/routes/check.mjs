import { getStatusForClient } from '../../queue';
import { wait } from '../../utils';
import * as statuses from '../../../static/lib/statuses';
import {
    HTTP_STATUS_SERVER_ERROR,
} from '../../../static/lib/http-status-codes';
import { setupClientIdCookie } from '../client-id-cookie';
import indexJson from './index/json';

const HTTP_TIMEOUT = 30000;
const LONG_POLL_TRY_INTERVAL = 5000;
const LONG_POLL_TRY_COUNT = HTTP_TIMEOUT / LONG_POLL_TRY_INTERVAL;

export default app => app.get('/check', async (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    const clientId = setupClientIdCookie(req, res);
    const prevStatus = req.query.status;
    for (
        let tries = prevStatus ? LONG_POLL_TRY_COUNT : 1;
        tries !== 0;
        tries -= 1
    )
    {
        const currentStatus = getStatusForClient(clientId);
        if (prevStatus !== currentStatus)
        {
            if (currentStatus === statuses.ERROR)
            {
                res.status(HTTP_STATUS_SERVER_ERROR);
            }
            indexJson(clientId, req, res);
            break;
        }
        await wait(LONG_POLL_TRY_INTERVAL);
    }
});
