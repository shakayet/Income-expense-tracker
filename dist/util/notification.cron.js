"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const node_cron_1 = __importDefault(require("node-cron"));
const notificationTrigger_1 = require("./notificationTrigger");
// cron.schedule('* * * * *', () => {
//   console.log('Running notifications every minute...');
//   sendMonthlyNotifications().catch(console.error);
// });
// Run monthly report notifications at 00:01 on 1st day of every month
node_cron_1.default.schedule('1 0 1 * *', () => {
    console.log('Running monthly notifications...');
    (0, notificationTrigger_1.sendMonthlyNotifications)().catch(console.error);
});
// Run yearly report notifications at 00:02 on 1st day of every year (Jan 1st)
node_cron_1.default.schedule('2 0 1 1 *', () => {
    console.log('Running yearly notifications...');
    (0, notificationTrigger_1.sendYearlyNotifications)().catch(console.error);
});
