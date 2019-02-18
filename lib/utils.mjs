const ENV = process.env.NODE_ENV || 'development';


function wait (ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getEnv ()
{
    return ENV;
}


export {
    wait,
    getEnv,
};
