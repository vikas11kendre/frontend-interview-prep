import { useState, useRef, useEffect, useCallback } from "react";
import { searchProducts } from "../utility/utility";


const useProductSearch = () => {
    const [data, setData] = useState<Record<string, any> | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProductData = useCallback(async (url: string, query: string, limit: number, skip: number, abortRequest = false): Promise<void> => {

        if (abortRequest) {
            controllerRef?.current?.abort();
            setData({});
            setError(null);
            return;
        }
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        setError(null);

        const controller = new AbortController();

        controllerRef.current = controller;

        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 5000);

        try {
            setLoading(true);
            const apiData = await searchProducts(url, query, limit, skip, controller.signal);
            setData(apiData);
        } catch (e: any) {
            if (e instanceof Error && e.name === "AbortError") {
                return;
            }
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
            clearTimeout(timeoutId);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, []);


    return { data, error, loading, fetchProductData, setError };
};

export default useProductSearch;
