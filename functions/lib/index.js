"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistGameState = exports.migrateOnConnect = exports.nextServer = void 0;
const https_1 = require("firebase-functions/v2/https");
const next_1 = __importDefault(require("next"));
const isDev = process.env.NODE_ENV !== 'production';
const server = (0, next_1.default)({
    dev: isDev,
    conf: { distDir: '.next' },
});
const nextjsHandle = server.getRequestHandler();
exports.nextServer = (0, https_1.onRequest)({ minInstances: 0, region: 'us-central1' }, (req, res) => {
    return server.prepare().then(() => nextjsHandle(req, res));
});
var migrateOnConnect_1 = require("./migrateOnConnect");
Object.defineProperty(exports, "migrateOnConnect", { enumerable: true, get: function () { return migrateOnConnect_1.migrateOnConnect; } });
var persistGameState_1 = require("./persistGameState");
Object.defineProperty(exports, "persistGameState", { enumerable: true, get: function () { return persistGameState_1.persistGameState; } });
//# sourceMappingURL=index.js.map