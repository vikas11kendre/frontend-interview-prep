import { useCallback, useEffect, useRef } from "react";

/**
 * 🔥 REQUIREMENT (What this hook should do)
 *
 * 1. Accept a function (fn) and a delay (in ms)
 * 2. Return a debounced version of that function
 * 3. When user calls the function repeatedly:
 *    - Do NOT execute immediately
 *    - Wait for the user to stop calling it for `delay` ms
 *    - Then execute ONLY the last call
 * 4. Cancel any previously scheduled execution if a new call happens
 * 5. Always use the latest version of fn (avoid stale closure)
 * 6. Clean up timers when component unmounts
 *
 * 📌 Use case:
 * - Search input (API calls)
 * - Auto-save
 * - Form validation
 * - Typing events
 */

const useDebounce = (fn, delay) => {

    // Stores timeout ID for delayed execution
    const timerRef = useRef(null);

    // Stores latest version of function (to avoid stale closure)
    const fnRef = useRef(fn);

    /**
     * Keep updating latest function reference
     * So debounced function always calls latest fn
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
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    /**
     * Debounced function
     * This is what user will call instead of original fn
     */
    const debouncedFn = useCallback((...args) => {

        /**
         * Clear any previously scheduled execution
         * Because we only want the LAST call to execute
         */
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        /**
         * Schedule execution after delay
         * If user keeps calling, this keeps getting reset
         */
        timerRef.current = setTimeout(() => {

            // Call latest function with latest arguments
            fnRef.current(...args);

        }, delay);

    }, [delay]);

    return debouncedFn;
};

export default useDebounce;
