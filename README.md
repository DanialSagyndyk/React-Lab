# JavaScript Runtime and Async

## Project Description

This project demonstrates important JavaScript runtime and asynchronous programming concepts using only HTML, CSS and Vanilla JavaScript.

The application contains three asynchronous tasks:

* Load Users
* Load Posts
* Load Comments

Each task has:

* Name
* Status
* Execution count
* Loading time

The loading time is randomly generated between 500 and 2000 milliseconds. Some tasks can randomly fail.

---

# 1. Closures and Private Counters

Tasks are created using the `createTask()` function:

```javascript
const task = createTask("Load Users");

task.run();
task.getCount();
task.reset();
```

Inside `createTask()` there is a private variable:

```javascript
let count = 0;
```

The variable cannot be accessed directly from outside the function.

Instead, it can only be changed through the returned methods:

```javascript
run()
getCount()
reset()
```

This happens because of a JavaScript closure.

Each call to `createTask()` creates a new closure with its own private `count`.

For example:

```javascript
const task1 = createTask("Load Users");
const task2 = createTask("Load Posts");

task1.run();
task1.run();

task2.run();

console.log(task1.getCount()); // 2
console.log(task2.getCount()); // 1
```

The counters are independent.

---

# 2. Call Stack

The Call Stack is used by JavaScript to keep track of currently executing functions.

For example, when the user clicks the "Run All Tasks" button:

```text
runAllTasks()
    ↓
runTask()
    ↓
task.run()
```

JavaScript puts the functions onto the Call Stack while they are executing.

When a function finishes, it is removed from the Call Stack.

Asynchronous operations such as `setTimeout()` do not stay on the Call Stack while they are waiting.

---

# 3. How JavaScript Continues While setTimeout Is Waiting

The tasks use:

```javascript
setTimeout(() => {
    // task result
}, loadingTime);
```

When `setTimeout()` is called, JavaScript does not stop and wait.

The timer is handled outside the Call Stack by the browser environment.

JavaScript can continue executing other code while the timer is running.

When the timer finishes, its callback becomes available in the Task Queue.

The Event Loop later moves the callback to the Call Stack when the Call Stack is empty.

---

# 4. Promises

Each task returns a Promise:

```javascript
return new Promise((resolve, reject) => {
    setTimeout(() => {
        if (failed) {
            reject(error);
        } else {
            resolve(result);
        }
    }, loadingTime);
});
```

A successful task calls:

```javascript
resolve()
```

A failed task calls:

```javascript
reject()
```

The application handles the result with `async/await` and `try/catch`.

Example:

```javascript
async function runTask(task) {
    try {
        const result = await task.run();
        return result;
    } catch (error) {
        return error;
    }
}
```

This allows the application to display both successful and failed tasks.

---

# 5. Handling Multiple Promises

The application uses:

```javascript
Promise.all(
    tasks.map(task => runTask(task))
);
```

This starts all tasks at approximately the same time.

`Promise.all()` waits until all returned promises are settled successfully through the `runTask()` wrapper.

Because `runTask()` catches individual errors, one failed task does not stop the application from displaying the results of the other tasks.

Example output:

```text
Load Users Completed
Load Posts Failed
Load Comments Completed
All tasks finished
```

---

# 6. Sequential Execution

Sequential execution means that the next task starts only after the previous task finishes.

The application uses:

```javascript
await task1.run();
await task2.run();
await task3.run();
```

The execution looks like:

```text
Load Users
    ↓
Load Posts
    ↓
Load Comments
```

If the tasks take:

```text
Users = 1000 ms
Posts = 1500 ms
Comments = 800 ms
```

The approximate total time is:

```text
1000 + 1500 + 800 = 3300 ms
```

Therefore, sequential execution can take approximately the sum of all task durations.

---

# 7. Concurrent Execution

Concurrent execution starts all tasks together:

```javascript
const results = await Promise.all(
    tasks.map(task => runTask(task))
);
```

The tasks start without waiting for each other:

```text
Load Users    ────────────
Load Posts    ─────────────────
Load Comments ────────
```

If the tasks take:

```text
Users = 1000 ms
Posts = 1500 ms
Comments = 800 ms
```

The total time is approximately:

```text
1500 ms
```

because the application waits for the slowest task.

Therefore:

```text
Sequential:
1000 + 1500 + 800 = 3300 ms

Concurrent:
max(1000, 1500, 800) = 1500 ms
```

The exact values change because the project uses random loading times.

---

# 8. Event Loop

The project contains an Event Loop demonstration with:

* `console.log()`
* `setTimeout()`
* `Promise.resolve().then()`
* `async/await`
* Two timers
* Two Promise callbacks
* An async function

Before running the demo, the expected output is:

```text
1. Script start
2. Async function start
3. Script end
4. Promise callback 1
5. Async function after await
6. Promise callback 2
7. Timer 1
8. Timer 2
```

The actual order should be:

```text
1. Script start
2. Async function start
3. Script end
4. Promise callback 1
5. Async function after await
6. Promise callback 2
7. Timer 1
8. Timer 2
```

The exact console also contains the header and footer messages added by the application.

---

# 9. Why This Order Happens

First, normal synchronous JavaScript runs on the Call Stack.

The following statements execute first:

```javascript
console.log("1. Script start");
asyncExample();
console.log("3. Script end");
```

The `asyncExample()` function starts immediately and prints:

```text
2. Async function start
```

When it reaches:

```javascript
await Promise.resolve();
```

the function pauses.

The continuation after `await` becomes a microtask.

The Promise callback created by:

```javascript
Promise.resolve().then(...)
```

also becomes a microtask.

After the synchronous code finishes, JavaScript processes the Microtask Queue before moving to timer callbacks.

Therefore:

```text
Promise callback 1
Async function after await
Promise callback 2
```

are executed before the timers.

Finally, the timer callbacks are processed:

```text
Timer 1
Timer 2
```

---

# 10. Call Stack → Microtask Queue → Task Queue → Event Loop

The simplified execution model is:

```text
              JavaScript Code
                    |
                    v
               Call Stack
                    |
                    v
              Event Loop
               /       \
              /         \
             v           v
     Microtask Queue   Task Queue
       Promises          Timers
       await             Events
```

The Event Loop checks whether the Call Stack is empty.

Microtasks such as Promise callbacks are processed before regular tasks such as timer callbacks.

This is why Promise callbacks usually execute before `setTimeout(..., 0)` callbacks.

---

# 11. Tasks vs Microtasks

## Tasks

Examples:

```javascript
setTimeout(() => {
    console.log("Timer");
}, 0);
```

Timer callbacks are placed into the Task Queue after the timer is ready.

Other examples include browser events such as clicks.

## Microtasks

Examples:

```javascript
Promise.resolve().then(() => {
    console.log("Promise");
});
```

Microtasks include Promise callbacks and the continuation of an async function after `await`.

Microtasks have higher priority than regular tasks.

After the current synchronous code finishes, the JavaScript runtime processes the available microtasks before taking the next regular task.

---

# 12. Async/Await

The application uses:

```javascript
async function runTask(task) {
    try {
        const result = await task.run();
        return result;
    } catch (error) {
        return error;
    }
}
```

`async` makes the function return a Promise.

`await` pauses that async function until the Promise settles.

It does not block the entire JavaScript program.

Other asynchronous operations can continue while the function is waiting.

---

# 13. Random Failures

Each task has a 25% chance of failure:

```javascript
const failed = Math.random() < 0.25;
```

If the task fails:

```javascript
reject({
    name: name,
    message: `${name} Failed`
});
```

If it succeeds:

```javascript
resolve({
    name: name,
    message: `${name} Completed`
});
```

The UI displays the final status.

Example:

```text
Load Users Completed
Load Posts Failed
Load Comments Completed
```

---

# 14. Conclusion

This project demonstrates several important JavaScript concepts:

1. Closures can keep variables private.
2. Each closure can have its own independent state.
3. The Call Stack executes synchronous JavaScript.
4. `setTimeout()` allows JavaScript to continue while waiting.
5. Promises represent future asynchronous results.
6. `async/await` makes asynchronous code easier to read.
7. Microtasks are processed before regular tasks.
8. `Promise.all()` can coordinate multiple asynchronous operations.
9. Sequential execution waits for each task one by one.
10. Concurrent execution starts multiple asynchronous operations without waiting for each one to finish first.
# React-Lab
