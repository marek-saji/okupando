import shortid from 'shortid';
import { HTTPS_CONFIGURED } from '../args-definitions';

const COOKIE_NAME = 'ClientId';
const HEADER_NAME = 'x-clientid';
const COOKIE_TTL = 31536000; // 1 year

const cookieOptions = {
    path: '/',
    maxAge: COOKIE_TTL,
    secure: HTTPS_CONFIGURED,
};

function setupClientIdCookie (req, res)
{
    let clientId = req.headers[HEADER_NAME];

    if (clientId)
    {
        return clientId;
    }

    clientId = req.cookies[COOKIE_NAME];
    if (!clientId)
    {
        clientId = shortid.generate();
    }
    res.cookie(COOKIE_NAME, clientId, cookieOptions);

    return clientId;
}

export { setupClientIdCookie };
