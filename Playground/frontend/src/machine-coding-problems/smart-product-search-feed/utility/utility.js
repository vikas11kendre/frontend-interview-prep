async function searchProducts(
  baseUrl,
  query,
  limit,
  skip,
  signal
) {
    const url = new URL(baseUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", limit);
    url.searchParams.set("skip", skip);

    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`Request failed ${response.status}`);
    }

    return response.json();
}

export { searchProducts };
