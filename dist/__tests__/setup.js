"use strict";
// Mock console methods to reduce noise in test output
global.console = Object.assign(Object.assign({}, console), { log: jest.fn(), debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() });
