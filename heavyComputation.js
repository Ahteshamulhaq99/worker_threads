const { parentPort, workerData } = require('worker_threads');
const getPrimeNumbers = require('./getPrimeNumbers');

const primes = getPrimeNumbers(workerData.start, workerData.range);

parentPort.postMessage(primes)