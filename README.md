okupando 🚽
===========

Single-page application with single-task focus -- checking if the toilet
is occupied or not.


Running
-------

This will work only on Raspberry Pi, as is requires `RPi.GPIO` python
package.

After usual cloning and `npm install`ing, run
`npm start -- --status-file=./sensor/wc-door-state`.

By default server will run with no Web Push support, run
`npm start -- --help` to see how to configure it.


Developing
----------

First create empty `./sensor/wc-door-state` file.

Run `npm run dev -- --status-file=./sensor/wc-door-state` to run server
that restarts on every file change. No browser reload at this point,
though. You may also want to add `--port=$PORT` to change from default
3000.

Change contents of `./sensor/wc-door-state` file to 1 and 0 to change
status to `free` and `occupied` respectively.

Testing Push notifications (which will work when accessing site on
`localhost`), you need to configure them. See `npm start -- --help`
for more information.



License
-------

Licensed under [MIT](./LICENSE).

Icon comes from Google Noto Emoji font, which is licensed under
[SIL Open Font License Version 1.1](./LICENSE-icon).
