const definitions = new Map();

const valueMap = new Map([
    ['true', true],
    ['yes', true],
    ['on', true],
    ['false', true],
    ['no', true],
    ['off', true],
]);

function register (name, description, defaultValue = undefined)
{
    definitions.set(
        normalize(name),
        {
            description,
            defaultValue,
        }
    );
}

function getValue (name)
{
    const lowerDash = normalize(name);
    const definition = definitions.get(lowerDash);

    if (definition === undefined)
    {
        throw new Error(`Unknown argument: ${name}.`);
    }

    const lowerUnderscore = lowerDash.replace(/-/g, '_');
    const upperUnderscore = lowerUnderscore.toUpperCase();

    const value =
        process.env[upperUnderscore]
        || process.env[`npm_config_okupando_${lowerUnderscore}`]
        || process.env[`npm_config_${lowerUnderscore}`]
        || definition.defaultValue;

    const valueNormalized =
        String(value)
            .trim()
            .toLowerCase();
    if (valueMap.has(valueNormalized))
    {
        return valueMap.get(valueNormalized);
    }

    return value;
}

function getAllValues ()
{
    const values = {};
    for (const name of definitions.keys())
    {
        const key = name.toUpperCase().replace(/-/g, '_');
        values[key] = getValue(name);
    }
    return values;
}

function printHelp ()
{
    const maxArgNameLength = Array.from(definitions.keys())
        .reduce((carry, name) => Math.max(carry, name.length), 0);

    for (const [name, { description, defaultValue }] of definitions)
    {
        process.stdout.write(` ${name} `);
        process.stdout.write(
            Array.from(Array(maxArgNameLength - name.length))
                .map(() => ' ')
                .join('')
        );
        process.stdout.write(` ${description.replace(/\.?$/, '.')}`);
        if (defaultValue !== undefined)
        {
            process.stdout.write(` Defaults to ${JSON.stringify(defaultValue)}`);
        }
        process.stdout.write('\n');
    }
}

function normalize (name)
{
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/, '-');
}


export {
    register,
    getValue,
    getAllValues,
    printHelp,
};
