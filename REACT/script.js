function createTask(name) {
    let count = 0;

    let status = "Idle";
    let lastTime = 0;

    function run() {
        count++;
        status = "Loading";

        const startTime = performance.now();

        const loadingTime =
            Math.floor(Math.random() * (2000 - 500 + 1)) + 500;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const endTime = performance.now();

                lastTime = Math.round(endTime - startTime);

                const failed = Math.random() < 0.25;

                if (failed) {
                    status = "Failed";

                    reject({
                        name: name,
                        message: `${name} Failed`
                    });
                } else {
                    status = "Completed";

                    resolve({
                        name: name,
                        message: `${name} Completed`,
                        time: lastTime
                    });
                }
            }, loadingTime);
        });
    }

    function getCount() {
        return count;
    }

    function getStatus() {
        return status;
    }

    function getTime() {
        return lastTime;
    }

    function reset() {
        count = 0;
        status = "Idle";
        lastTime = 0;
    }

    // Public methods
    return {
        run,
        getCount,
        getStatus,
        getTime,
        reset,
        getName: () => name
    };
}


// Create tasks

const task1 = createTask("Load Users");
const task2 = createTask("Load Posts");
const task3 = createTask("Load Comments");

const tasks = [task1, task2, task3];


// Ui elements


const tasksContainer = document.getElementById("tasks");
const executionResult = document.getElementById("executionResult");

const runAllBtn = document.getElementById("runAllBtn");
const sequentialBtn = document.getElementById("sequentialBtn");
const concurrentBtn = document.getElementById("concurrentBtn");
const resetBtn = document.getElementById("resetBtn");
const eventLoopBtn = document.getElementById("eventLoopBtn");


// Render tasks

function renderTasks() {
    tasksContainer.innerHTML = "";

    tasks.forEach(task => {
        const div = document.createElement("div");

        const statusClass =
            task.getStatus().toLowerCase();

        div.className = "task";

        div.innerHTML = `
            <h3>${task.getName()}</h3>

            <p>
                Status:
                <span class="status ${statusClass}">
                    ${task.getStatus()}
                </span>
            </p>

            <p>
                Execution count:
                <strong>${task.getCount()}</strong>
            </p>

            <p>
                Loading time:
                <strong>
                    ${task.getTime() > 0 ? task.getTime() + " ms" : "-"}
                </strong>
            </p>
        `;

        tasksContainer.appendChild(div);
    });
}


// Disable buttons

function setButtonsDisabled(disabled) {
    runAllBtn.disabled = disabled;
    sequentialBtn.disabled = disabled;
    concurrentBtn.disabled = disabled;
}


// Run one task


async function runTask(task) {
    try {
        const result = await task.run();

        renderTasks();

        return {
            success: true,
            ...result
        };

    } catch (error) {
        renderTasks();

        return {
            success: false,
            name: error.name,
            message: error.message
        };
    }
}


async function runAllTasks() {
    setButtonsDisabled(true);

    executionResult.textContent = "Running all tasks...";

    const startTime = performance.now();

    const results = await Promise.all(
        tasks.map(task => runTask(task))
    );

    const endTime = performance.now();

    const totalTime = Math.round(endTime - startTime);

    executionResult.innerHTML = `
        <strong>All tasks finished</strong><br>
        Total execution time: ${totalTime} ms
        <br><br>

        ${results.map(result =>
            result.success
                ? `${result.name} Completed`
                : `${result.name} Failed`
        ).join("<br>")}
    `;

    setButtonsDisabled(false);
}


// ==========================================
// SEQUENTIAL EXECUTION
// ==========================================

async function runSequential() {
    setButtonsDisabled(true);

    executionResult.textContent =
        "Running tasks sequentially...";

    tasks.forEach(task => task.reset());
    renderTasks();

    const startTime = performance.now();

    const results = [];

    for (const task of tasks) {
        const result = await runTask(task);
        results.push(result);
    }

    const endTime = performance.now();

    const totalTime = Math.round(endTime - startTime);

    executionResult.innerHTML = `
        <strong>Sequential execution finished</strong><br>
        Total execution time: ${totalTime} ms
        <br><br>

        ${results.map(result =>
            result.success
                ? `${result.name} Completed`
                : `${result.name} Failed`
        ).join("<br>")}
    `;

    setButtonsDisabled(false);
}


// Concurrent execution 

async function runConcurrent() {
    setButtonsDisabled(true);

    executionResult.textContent =
        "Running tasks concurrently...";

    tasks.forEach(task => task.reset());
    renderTasks();

    const startTime = performance.now();

    const results = await Promise.all(
        tasks.map(task => runTask(task))
    );

    const endTime = performance.now();

    const totalTime = Math.round(endTime - startTime);

    executionResult.innerHTML = `
        <strong>Concurrent execution finished</strong><br>
        Total execution time: ${totalTime} ms
        <br><br>

        ${results.map(result =>
            result.success
                ? `${result.name} Completed`
                : `${result.name} Failed`
        ).join("<br>")}
    `;

    setButtonsDisabled(false);
}



// Reset

function resetTasks() {
    tasks.forEach(task => task.reset());

    executionResult.textContent = "";

    renderTasks();
}


// Event loop demo

async function eventLoopDemo() {
    console.log("1. Script start");

    setTimeout(() => {
        console.log("7. Timer 1");
    }, 0);

    Promise.resolve().then(() => {
        console.log("4. Promise callback 1");
    });

    async function asyncExample() {
        console.log("2. Async function start");

        await Promise.resolve();

        console.log("5. Async function after await");

        Promise.resolve().then(() => {
            console.log("6. Promise callback 2");
        });
    }

    asyncExample();

    setTimeout(() => {
        console.log("8. Timer 2");
    }, 0);

    console.log("3. Script end");
}

eventLoopBtn.addEventListener("click", () => {
    console.clear();

    console.log("========== EVENT LOOP DEMO ==========");

    eventLoopDemo();

    console.log("========== END OF SCRIPT ==========");
});


// Button events

runAllBtn.addEventListener("click", runAllTasks);

sequentialBtn.addEventListener("click", runSequential);

concurrentBtn.addEventListener("click", runConcurrent);

resetBtn.addEventListener("click", resetTasks);


// Initial render

renderTasks();
