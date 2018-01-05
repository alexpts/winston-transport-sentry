winston-transport-sentry
========================


### Compitable
Winston@3+


### Install
`npm i --save winston@3 winston-transport-sentry`

Sentry transport for winston@3 logger for node js
-------------------------------------------------
Follow this sample configuration to use:

```javascript
const winston = require('winston'),
const Mail = require('winston-mail').Mail,
const Sentry = require('winston-transport-sentry');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({level: 'silly'}),
        new Sentry({
            level: 'warn',
            dsn: "{{ YOUR SENTRY DSN }}",
            tags: { key: 'value' },
            extra: { key: 'value' },
            patchGlobal: false
        })
    ],
});
```

If you want to use patchGlobal to catch all uncaught errors, simply pass it as option like this:

```javascript
new Sentry({
    patchGlobal: true
});
```

Winston logging levels are mapped to the default sentry levels like this:

```javascript
{
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error'
}
```
