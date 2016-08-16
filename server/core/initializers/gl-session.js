

module.exports = {
    runFn: function (app, next) {
        const session = require('express-session');
        const GLSessionServerClient = require('gl-session-server-client')(session);

        app.express.use(session({
            store: new GLSessionServerClient({
                host: app.config.glSessionServerClient.host,
                port: app.config.glSessionServerClient.port,
                path: app.config.glSessionServerClient.path
            }),
            secret: app.config.glSessionServerClient.secret,
            resave: false,
            saveUninitialized: true,
            cookie: {secure: false}
        }));

        next();
    }
};
