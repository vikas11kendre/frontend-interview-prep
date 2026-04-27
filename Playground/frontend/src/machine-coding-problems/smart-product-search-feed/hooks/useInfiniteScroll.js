import { useEffect, useRef } from "react";

/**
 * 🔥 REQUIREMENT (What this hook should do)
 *
 * 1. Create an invisible target element reference
 * 2. Watch that target using IntersectionObserver
 * 3. When target comes near / inside viewport:
 *    - call the provided callback
 * 4. Allow disabling observer when:
 *    - data is loading
 *    - all items are already loaded
 * 5. Clean up observer when component unmounts
 *
 * 📌 Use case:
 * - Product listing
 * - Social media feed
 * - Chat history loading
 * - Pagination on scroll
 */

const useInfiniteScroll = ({
  onLoadMore,
  root = null,
  rootMargin = "1px",
  threshold = 0.1,
  isLoading = false,
  hasMore = true,
  enabled = true,
}) => {
  // ref for the bottom sentinel div
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (isLoading || !hasMore || !enabled) {
      return;
    }
    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [onLoadMore, hasMore, isLoading, root, rootMargin, threshold, enabled]);

  return { sentinelRef };
};

export default useInfiniteScroll;
