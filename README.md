# URL Shortener

### A coding challenge suggested by John Cricket in his codingchallenge.fyi project. 

This is a url shortener developed using Express.js as the API provider and OpenUI5 (SAPUI5) to build the frontend. 

To run it locally, you need Node.js, UI5 tools for VSCode and these dependencies set up in your package.json file

```
 "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.7",
    "ui5-middleware-simpleproxy": "^3.2.10",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@sap/ux-ui5-tooling": "1",
    "@ui5/cli": "^3.0.0"
  },
```

  API server listens by default on port 3001, and the web application in port 8080. Remember if deployed in a server to remove the proxy in ui5.yaml!
