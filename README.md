# URL Shortener

### A coding challenge suggested by John Cricket in his [codingchallenges.fyi](https://codingchallenges.fyi/) project. 

This is a url shortener developed using [Express.js](https://expressjs.com/) to build the RESTful API server and [SAPUI5](https://sapui5.hana.ondemand.com/) to build the frontend. 

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
To run the Server, use the following command:
```cd .\urlshortener\urlshortener\webapp\server | node app.js```

To execute the app locally you can either serve it as a local UI5 app or in the Fiori Launchpad instance provided with ui5-tools, just run ```npm start``` to check the app in the current FLP theme.

  API server listens by default on port 3001, and the web application in port 8080. Remember if deployed in a server to remove the proxy config in ui5.yaml!
