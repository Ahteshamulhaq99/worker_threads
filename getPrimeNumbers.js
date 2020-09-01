module.exports = function generatePrimes(start, range) {
  let primes = []
  let isPrime = true;
  let end = start + range;
  for (let i = start; i < end; i++) {
    for (let j = start; j < Math.sqrt(end); j++) {
      if (i !== j && i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(i);
    }
    isPrime = true;
  }
  return primes
};
