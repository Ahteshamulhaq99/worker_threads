const express = require("express");
const { isMainThread, Worker, workerData } = require("worker_threads");
const bodyParser = require("body-parser");
let { users } = require("./users.json");
const getPrimeNumbers = require("./getPrimeNumbers");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server is up and runnings");
});

app.get("/get-users", (req, res) => {
  res.json(users);
});

app.post("/add-user", (req, res) => {
  users.push({ ...req.body.user });
  res.json(users);
});

app.put("/update-user", (req, res) => {
  users = users.map((user) => {
    if (user.uuid === req.body.user.uuid) {
      user = {
        ...req.body.user,
      };
    }
    return user;
  });
  res.json(users);
});

app.delete("/delete-user", (req, res) => {
  users = users.filter((user) => {
    if (user.uuid !== req.body.user.uuid) {
      return user;
    }
  });
  res.json(users);
});

// this code runs synchronously and is a heavy computation
app.post("/get-prime-numbers", (req, res) => {
  console.time("withoutThreads");
  const primes = getPrimeNumbers(req.body.start, req.body.range);
  console.timeEnd("withoutThreads");
  res.json(primes.sort((a, b) => a - b));
});

app.post("/get-prime-numbers-using-worker-threads", (req, res) => {
  if (isMainThread) {
    console.time("withThreads");
    const max = req.body.range;
    const min = req.body.start;
    let primes = [];
    const __filename = "./heavyComputation.js";
    const threadCount = req.body.threadCount;
    const threads = new Set();

    const range = Math.ceil((max - min) / threadCount);
    let start = min;
    for (let i = 0; i < threadCount - 1; i++) {
      const myStart = start;
      threads.add(
        new Worker(__filename, { workerData: { start: myStart, range } })
      );
      start += range;
    }

    threads.add(
      new Worker(__filename, {
        workerData: { start, range: range + ((max - min + 1) % threadCount) },
      })
    );

    for (let worker of threads) {
      worker.on("error", (err) => {
        throw err;
      });

      worker.on("exit", () => {
        threads.delete(worker);
        console.log(`Thread exiting, ${threads.size} running...`);
        if (threads.size === 0) {
          console.timeEnd("withThreads");
          res.json(primes.sort((a, b) => a - b));
        }
      });

      worker.on("message", (newPrimes) => {
        primes = primes.concat(newPrimes);
      });
    }
  } else {
    console.log("Code being executed on worker thread");
  }
});

app.listen(9000, () => {
  console.log("App is now up on port 9000");
});
