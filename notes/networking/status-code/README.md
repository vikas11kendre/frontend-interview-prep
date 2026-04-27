
1xx → Informational
2xx → Success
3xx → Redirection
4xx → Client Error
5xx → Server Error

✅ 1. Success Codes (2xx)

These mean request worked

Most important ones:
200 OK → Success (GET, PUT)
201 Created → Resource created (POST)
204 No Content → Success but no response body (DELETE)

👉 Example:

GET /products → 200
POST /products → 201
DELETE /products/1 → 204

🔁 2. Redirection (3xx)

Mostly handled by browser — rarely used manually in frontend apps.

301 Moved Permanently
302 Found (temporary redirect)
304 Not Modified (important for caching)

👉 304 is used with caching (ETag, If-None-Match)


❌ 3. Client Errors (4xx)

👉 Your request is wrong

Most important ones:
400 Bad Request → invalid input
401 Unauthorized → not logged in
403 Forbidden → no permission
404 Not Found → resource not found
409 Conflict → duplicate / state conflict
422 Unprocessable Entity → validation failed
429 Too Many Requests → rate limited

POST /login → 401 (wrong token / not logged in)
GET /admin → 403 (no permission)
GET /product/999 → 404
POST /signup → 409 (email already exists)
POST /form → 422 (invalid fields)

💥 4. Server Errors (5xx)

👉 Backend failed

Most important:
500 Internal Server Error → generic failure
502 Bad Gateway → upstream failure
503 Service Unavailable → server overloaded/down
504 Gateway Timeout → backend didn’t respond