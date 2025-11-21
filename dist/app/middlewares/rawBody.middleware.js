"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawBodyMiddleware = void 0;
const rawBodyMiddleware = (req, res, next) => {
    req.setEncoding('utf8');
    let data = '';
    req.on('data', (chunk) => {
        data += chunk;
    });
    req.on('end', () => {
        req.rawBody = data;
        next();
    });
};
exports.rawBodyMiddleware = rawBodyMiddleware;
