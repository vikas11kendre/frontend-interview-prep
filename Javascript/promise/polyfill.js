// ─────────────────────────────────────────────
// 1. Promise.all
// Resolves when ALL resolve, rejects on first rejection
// ─────────────────────────────────────────────
Promise.myAll = (array) => {
    return new Promise((resolve, reject) => {
        if (array.length === 0) return resolve([]);

        const results = new Array(array.length);
        let count = 0;

        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i])
                .then((res) => {
                    results[i] = res;            // preserve order
                    count++;
                    if (count === array.length) resolve(results);
                })
                .catch((e) => reject(e));        // first rejection wins
        }
    });
};

// ─────────────────────────────────────────────
// 2. Promise.allSettled
// Always resolves with ALL outcomes (never rejects)
// ─────────────────────────────────────────────
Promise.myAllSettled = (array) => {
    return new Promise((resolve) => {
        if (array.length === 0) return resolve([]);

        const results = new Array(array.length);
        let count = 0;

        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i])
                .then((res) => {
                    results[i] = { status: "fulfilled", value: res };
                })
                .catch((e) => {
                    results[i] = { status: "rejected", reason: e };
                })
                .finally(() => {
                    count++;
                    if (count === array.length) resolve(results); // always resolves
                });
        }
    });
};

// ─────────────────────────────────────────────
// 3. Promise.race
// Resolves/rejects with the FIRST settled promise
// ─────────────────────────────────────────────
Promise.myRace = (array) => {
    return new Promise((resolve, reject) => {
        if (array.length === 0) return; // hangs forever (native behaviour)

        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i])
                .then((res) => resolve(res))  // first resolve wins
                .catch((e) => reject(e));     // first reject wins
        }
        // After the first settlement, subsequent resolve/reject calls
        // are silently ignored by the Promise constructor
    });
};

// ─────────────────────────────────────────────
// 4. Promise.any
// Resolves with FIRST fulfilled, rejects if ALL reject
// ─────────────────────────────────────────────
Promise.myAny = (array) => {
    return new Promise((resolve, reject) => {
        if (array.length === 0)
            return reject(new AggregateError([], "All promises were rejected"));

        const errors = new Array(array.length);
        let count = 0;

        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i])
                .then((res) => resolve(res))  // first resolve wins
                .catch((e) => {
                    errors[i] = e;            // preserve error order
                })
                .finally(() => {
                    count++;
                    if (count === array.length) {
                        reject(new AggregateError(errors, "All promises were rejected"));
                    }
                });
        }
    });
};