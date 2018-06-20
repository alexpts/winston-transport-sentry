const Raven = require('raven');
const Transport = require('winston-transport');
const _ = require('lodash');
const util = require('util');

const winstonLevelToSentryLevel = {
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error'
};

/**
 * @param {Error} error
 */
const errorHandler = (error) => {
    console.log(error);
};

/**
 * @param {{}} info
 * @param {string} info.level
 * @return {{}}
 */
const prepareMeta = (info) => {
    let extra = Object.assign({}, info);
    delete extra.message;
    delete extra.level;
    delete extra.tags;

    let error = info.message instanceof Error ? info.message : new Error(info.message);
    extra.stackError = error.stack;

    return {
        level: winstonLevelToSentryLevel[info.level],
        tags: info.tags || {},
        extra,
    };
};

/**
 * @param {{}} options
 * @return {{}}
 */
const createRaven = (options) => {
    const raven = Raven.config(options.dsn, options);
    raven.captureException = util.promisify(raven.captureException);
    raven.captureMessage = util.promisify(raven.captureMessage);

    if (options.install || options.patchGlobal) {
        raven.install();
    }

    if (options.errorHandler && _.isFunction(options.errorHandler)) {
        raven.on('error', options.errorHandler);
    }

    return raven;
};

class SentryWinstonTransport extends Transport {
    constructor(options) {
        super(options);

        this.options = Object.assign({
            dsn: '',
            patchGlobal: false,
            install: false,
            tags: {},
            extra: {},
            errorHandler,
        }, options);

        this.raven = createRaven(this.options);
    }

    /**
     * @param {{}} info
     * @param {string} info.level
     * @param {Error|string} info.message
     * @param {Function} done
     */
    async log(info, done) {
        if (this.silent) return done(null, true);
        let meta = prepareMeta(info);

        let method = info.message instanceof Error ? 'captureException' : 'captureMessage';

        try {
            let eventId = await this.raven[method](info.message, meta);
            done(null, eventId);
        } catch (error) {
            done(error);
        }
    }
}

SentryWinstonTransport.prototype.name = 'sentry';
module.exports = SentryWinstonTransport;
