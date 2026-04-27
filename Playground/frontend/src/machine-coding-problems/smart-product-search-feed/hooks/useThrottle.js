import { useCallback, useEffect, useRef } from "react";

/**
 * 🔥 REQUIREMENT (What this hook should do)
 *
 * 1. Accept a function (fn) and a delay (in ms)
 * 2. Return a throttled version of that function
 * 3. When user calls the throttled function multiple times:
 *    - Execute immediately on first call
 *    - Ignore repeated calls within the delay window
 *    - Optionally execute the last call after delay (trailing execution)
 * 4. Ensure latest version of fn is always used (avoid stale closure)
 * 5. Clean up timers when component unmounts
 *
 * 📌 Use case:
 * - Scroll events
 * - Resize events
 * - Infinite scroll
 * - Prevent API spamming
 */


const useThrottle = (fn, delay) => {

    // Stores timeout ID for trailing execution
    const timerRef = useRef(null);

    // Stores latest version of function (to avoid stale closure)
    const fnRef = useRef(fn);

    // Tracks last time function was executed
    const lastRequestTrack = useRef(0);

    /**
     * Keep updating latest function reference
     * So throttled function always calls latest fn
     */
    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    /**
     * Cleanup when component unmounts
     * Prevent memory leaks
     */
    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current);
        };
    }, []);

    /**
     * Throttled function
     * This is what user will call instead of original fn
     */
    const throttleFn = useCallback((...args) => {

        // Current timestamp
        let currentTime = Date.now();

        /**
         * Calculate remaining time before next allowed execution
         * Example:
         * delay = 1000ms
         * last executed at 0ms
         * now at 400ms
         * remaining = 600ms
         */
        let remaining = delay - (currentTime - lastRequestTrack.current);

        // If enough time has passed → execute immediately
        if (remaining <= 0) {

            // Update last execution time
            lastRequestTrack.current = currentTime;

            // Call latest function
            fnRef.current(...args);

        } else {

            /**
             * If called too soon:
             * Schedule execution after remaining time
             * (this is trailing call)
             */

            // Clear previous scheduled call (important)
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // Schedule new execution
            timerRef.current = setTimeout(() => {

                // Update last execution time
                lastRequestTrack.current = Date.now();

                // Call latest function
                fnRef.current(...args);

            }, remaining);
        }

    }, [delay]);

    return throttleFn;
};

export default useThrottle;
