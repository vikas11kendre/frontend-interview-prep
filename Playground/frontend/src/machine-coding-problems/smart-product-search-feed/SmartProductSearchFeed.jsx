import { useEffect, useState, useCallback, useId } from "react";
import styles from "./SmartProductSearchFeed.module.css";
import ProductCard from "./components/ProductCard";
import { LIMIT, PRODUCT_SEARCH_ENDPOINT } from "./utility/constant";
import useProductSearch from "./hooks/useProductSearch";
import useDebounce from "./hooks/useDebounce";
import useThrottle from "./hooks/useThrottle";
import VirtualizedList from "../smart-product-search-feed/components/VirtulizedList";

export default function SmartProductSearchFeed() {
    const { data, error, loading, fetchProductData } = useProductSearch();
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [infiniteScrolling, setInfinitScrolling] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const debouncedFetchProductData = useDebounce(fetchProductData, 700);
    const throtttleFn = useThrottle(fetchProductData, 800);

    const headingId = useId();
    const feedId = useId();
    const searchHelpId = useId();
    const toggleHelpId = useId();

    useEffect(() => {
        if (data?.total) {
            setProducts(prev => {
                if (data.skip === 0) return data.products.map((p, i) => ({ ...p, _uid: i }));
                const offset = prev.length;
                return [...prev, ...data.products.map((p, i) => ({ ...p, _uid: offset + i }))];
            });
            setTotal(data?.total);
        } else {
            setProducts([]);
            setTotal(0);
        }
    }, [data]);



    const handleInputChange = useCallback((e) => {
        let value = e.target.value;
        setSearchInput(value);
        setHasSearched(value.trim().length > 0);
        if (value === "") {
            let abortRequest = true;
            debouncedFetchProductData(PRODUCT_SEARCH_ENDPOINT, e.target.value, LIMIT, 0, abortRequest);
            return;
        }
        debouncedFetchProductData(PRODUCT_SEARCH_ENDPOINT, e.target.value, LIMIT, 0);
    }, [debouncedFetchProductData]);

    const handleLoadMore = useCallback(() => {
        if (loading || products.length >= total) return;
        throtttleFn(PRODUCT_SEARCH_ENDPOINT, searchInput, LIMIT, products.length);
    }, [loading, products.length, total, searchInput, throtttleFn]);

    const allLoaded = total > 0 && products.length >= total;
    const isLoadMoreDisabled = loading || allLoaded;
    const noResults = hasSearched && !loading && total === 0 && !error;

    let statusText = "";
    if (loading && products.length === 0) {
        statusText = "Loading products…";
    } else if (loading) {
        statusText = `Loading more products. ${products.length} of ${total} loaded.`;
    } else if (noResults) {
        statusText = `No products found for “${searchInput}”.`;
    } else if (allLoaded) {
        statusText = `All ${total} products loaded.`;
    } else if (total > 0) {
        statusText = `Showing ${products.length} of ${total} products.`;
    }

    return (
        <main className={styles.SmartProductSearchContainer} aria-labelledby={headingId}>
            <h1 id={headingId} className={styles.SmartProductSearchContainer__heading}>
                Product Listing Page
            </h1>

            <div className={styles.SmartProductSearchContainer__toggle}>
                <input
                    id="infiniteScrollModeToggle"
                    type="checkbox"
                    role="switch"
                    checked={infiniteScrolling}
                    onChange={(e) => setInfinitScrolling(e.target.checked)}
                    aria-describedby={toggleHelpId}
                />
                <label htmlFor="infiniteScrollModeToggle">
                    Enable infinite scrolling mode
                </label>
                <span id={toggleHelpId} className={styles.srOnly}>
                    When on, more products load automatically as you scroll. When off, use the Load more products button.
                </span>
            </div>

            <div className={styles.SmartProductSearchContainer__SearchBar} role="search">
                <label htmlFor="SmartProductSearch__input">
                    Search product
                </label>
                <input
                    id="SmartProductSearch__input"
                    type="search"
                    value={searchInput}
                    onChange={handleInputChange}
                    aria-controls={feedId}
                    aria-autocomplete="list"
                    aria-describedby={searchHelpId}
                    placeholder="e.g., laptop, watch, perfume"
                    autoComplete="off"
                    spellCheck="false"
                />
                <span id={searchHelpId} className={styles.srOnly}>
                    Results update automatically as you type. Use the Tab key to move into the results.
                </span>
            </div>

            <p
                className={styles.SmartProductSearchContainer__status}
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
                {statusText}
            </p>

            <VirtualizedList
                id={feedId}
                className={styles.ProductListViewport}
                gridClassName={styles.ProductList}
                items={products}
                containerHeight={700}
                rowHeight={380}
                overScanCount={2}
                minColumnWidth={220}
                gap={20}
                role="feed"
                aria-busy={loading}
                aria-labelledby={headingId}
                onEndReached={infiniteScrolling ? handleLoadMore : undefined}
                itemContent={(product, index) => (
                    <ProductCard
                        key={product._uid}
                        id={product.id}
                        title={product.title}
                        description={product.description}
                        imageURl={product.images[0]}
                        price={product.price}
                        posInSet={index + 1}
                        setSize={total || products.length}
                    />
                )}
            />

            {!infiniteScrolling && total > 0 && (
                <button
                    type="button"
                    className={styles.SmartProductSearchContainer__loadMore}
                    onClick={handleLoadMore}
                    aria-disabled={isLoadMoreDisabled}
                    aria-controls={feedId}
                >
                    {allLoaded ? "All products loaded" : "Load more products"}
                </button>
            )}

            {error && (
                <p
                    className={styles.SmartProductSearchContainer__error}
                    role="alert"
                >
                    {error}
                </p>
            )}
        </main>
    );
}
