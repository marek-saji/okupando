okupando 🚽
===========

Single-page application with single-task focus -- checking if the toilet
is occupied or not.


Running
-------

You need to run it on Raspberry Pi.

After usual cloning and `npm install`ing, run
`npm start -- --gpio-channel CHANNEL_NO`, where `CHANNEL_NO` is
Raspberry Pi pin in RPI (not BCM) mode where you have your button
plugged in.

By default server will run with no HTTPS and push notifications,
run `npm start -- --help` to see how to configure those.


Developing
----------

Running server with no `--gpio-channel` and `NODE_ENV=development` will
start debug mode when you can change status with keypresses.
Run `npm run dev` to run server that restarts on every file change.
No browser reload at this point, though.

Run `npm start -- --help` for all available options.


License
-------

Licensed under [MIT](./LICENSE).

Icon comes from Google Noto Emoji font, which is licensed under
[SIL Open Font License Version 1.1](./LICENSE-icon).
