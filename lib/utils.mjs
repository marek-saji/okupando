const ENV = process.env.NODE_ENV || 'production';


function wait (ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getEnv ()
{
    return ENV;
}

function looksLikeIp (address)
{
    return /^([0-9.]+|[0-0a-f:]+)$/.test(String(address).trim());
}

function isQueryStringTruthy (string, defaultValue = false)
{
    if (string === undefined || string === null) {
        return defaultValue;
    }
    return ['', '1', 'true', 'yes'].includes(String(string).toLowerCase());
}


export {
    wait,
    getEnv,
    looksLikeIp,
    isQueryStringTruthy,
};
