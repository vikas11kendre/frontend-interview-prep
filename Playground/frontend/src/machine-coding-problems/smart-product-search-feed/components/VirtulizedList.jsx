import { useEffect, useMemo, useRef, useState } from "react";

const VirtualizedGrid = ({
    items = [],
    containerHeight = 700,
    rowHeight = 360,
    overScanCount = 1,
    minColumnWidth = 220,
    gap = 20,
    itemContent,
    className = "",
    gridClassName = "",
    onEndReached,
    endReachedOffset = 300,
    ...restProps
}) => {
    const containerRef = useRef(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const measure = () => {
            setContainerWidth(containerRef.current?.clientWidth ?? 0);
        };

        measure();

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const columnCount = useMemo(() => {
        if (!containerWidth) return 1;

        return Math.max(
            1,
            Math.floor((containerWidth + gap) / (minColumnWidth + gap))
        );
    }, [containerWidth, gap, minColumnWidth]);

    const rowCount = Math.ceil(items.length / columnCount);
    const visibleRowCount = Math.ceil(containerHeight / rowHeight);
    const startRow = Math.max(
        0,
        Math.floor(scrollTop / rowHeight) - overScanCount
    );
    const endRow = Math.min(
        rowCount,
        startRow + visibleRowCount + overScanCount * 2
    );
    const startIndex = startRow * columnCount;
    const endIndex = Math.min(items.length, endRow * columnCount);
    const visibleItems = items.slice(startIndex, endIndex);

    const handleScroll = (event) => {
        const nextScrollTop = event.currentTarget.scrollTop;
        const clientHeight = event.currentTarget.clientHeight;
        const scrollHeight = event.currentTarget.scrollHeight;

        setScrollTop(nextScrollTop);

        if (
            onEndReached &&
            nextScrollTop + clientHeight >= scrollHeight - endReachedOffset
        ) {
            onEndReached();
        }
    };

    return (
        <div
            ref={containerRef}
            className={className}
            onScroll={handleScroll}
            {...restProps}
            style={{
                position: "relative",
                height: `${containerHeight}px`,
                overflowY: "auto",
                overflowAnchor: "none",
            }}
        >
            <div
                style={{
                    position: "relative",
                    height: `${rowCount * rowHeight}px`,
                }}
            >
                <div
                    className={gridClassName}
                    style={{
                        position: "absolute",
                        top: `${startRow * rowHeight}px`,
                        left: 0,
                        right: 0,
                        display: "grid",
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        gap: `${gap}px`,
                    }}
                >
                    {visibleItems.map((item, index) =>
                        itemContent ? itemContent(item, startIndex + index) : null
                    )}
                </div>
            </div>
        </div>
    );
};

export default VirtualizedGrid;
