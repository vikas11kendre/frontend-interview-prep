CommonJS (CJS) — Node.js's original module system (2009)
Uses require() to load and module.exports to export. Loads synchronously, so you can use require anywhere — inside functions, conditionals, loops. Works in Node.js by default with no config.
jsconst express = require('express')
const { useState } = require('react')

module.exports = myFunction
module.exports = { a, b, c }
ES Modules (ESM) — JavaScript's official standard (~2015 spec, Node stable ~2020)
Uses import/export. Loads asynchronously. import must be at the top of the file — no conditional imports. In Node.js, requires "type": "module" in package.json. Works out of the box in Next.js, React, Vite, etc.
jsimport express from 'express'
import { useState } from 'react'

export default myFunction
export { a, b, c }
When to use what:
Frontend (React/Next.js) → import (always), Backend (Node/Express) → require is simpler, import works with "type": "module" in package.json. You can't mix them in the same file.
