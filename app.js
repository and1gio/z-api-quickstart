'use strict';

/**
 * Module dependencies.
 */
let initializersLoader = require("./server/core/bin/initializers-loader");

/**
 * Current Directory
 */
let dir = __dirname;

/**
 * Required Modules
 */
let fs = require("fs");
let camelCase = require('camelcase');

/**
 * load initializers
 */
let app = {
    folderPath: {
        root: dir,

        public: dir + '/public',

        initializer: {
            core: dir + '/server/core/initializers/',
            app: dir + '/server/app/initializers/'
        },

        config: {
            app: dir + '/server-config/app/',
            core: dir + '/server-config/core/'
        },

        route: dir + '/server/app/routes/',

        businessLogic: dir + '/server/app/business-logic/',

        filter: dir + '/server/app/filters/',
        validator: dir + '/server/app/validators/',

        sessionDataLoader: dir + '/server/app/session-data-loaders/',

        middleware: {
            beforeRoute: dir + '/server/app/middleware/before-route/',
            afterRoute: dir + '/server/app/middleware/after-route/'
        }
    },

    env: process.env.NODE_ENV,

    utils: {
        readDir: function (app, namespace, dir) {
            if(fs.existsSync(dir)){
                var rootDir = fs.readdirSync(dir);

                if(rootDir && rootDir.length > 0){
                    rootDir.forEach(function (file) {
                        let nameParts = file.split('/');
                        let name = camelCase(nameParts[(nameParts.length - 1)].split(".")[0]);
                        let filePath = dir + file;

                        if (fs.lstatSync(filePath).isDirectory()) {
                            namespace[name] = {};
                            return app.utils.readDir(app, namespace[name], filePath);
                        } else {
                            if (fs.existsSync(filePath)) {
                                const module = require(filePath);
                                namespace[name] = new module(app);
                            }
                        }
                    });
                }
            }
        },
        callSessionLoaders: function (valNamespace, fnNamespace, req, asyncFunctions) {
            for (var i in fnNamespace) {
                if (typeof fnNamespace[i] == "function" || typeof fnNamespace[i].fn == "function") {
                    asyncFunctions.push((function (index) {
                        const fn = fnNamespace[index].fn || fnNamespace[index];
                        return function (next) {
                            fn(req, function (err, res) {
                                if (!err) {
                                    valNamespace[index] = res;
                                }
                                next(err);
                            });
                        }
                    })(i));
                } else {
                    if (fnNamespace[i].include || fnNamespace[i].exclude) {
                        continue;
                    }
                    valNamespace[i] = {};
                    app.utils.callSessionLoaders(valNamespace[i], fnNamespace[i], req, asyncFunctions);
                }
            }
        }
    }
};

/**
 * Start Initializer Loader
 */
initializersLoader(app, function (err) {

});