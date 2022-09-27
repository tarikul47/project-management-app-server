const auth = require("json-server-auth");
const jsonServer = require("json-server");
const express = require("express");
const http = require("http");

const app = express(); // application 
const server = http.createServer(app); // http server 
const io = require("socket.io")(server); // socekt by http server 

global.io = io; // io socket save as global 

const router = jsonServer.router("db.json"); // router set 

// response middleware
router.render = (req, res) => {
  const path = req.path;
  const method = req.method;

  // conversations event fire
  if (
    path.includes("/conversations") &&
    (method === "POST" || method === "PATCH")
  ) {
    // emit socket event
    io.emit("conversation", {
      data: res.locals.data,
    });
  }

  // message event fire
  if (path.includes("/messages") && method === "POST") {
    // emit socket event
    io.emit("messages", {
      data: res.locals.data,
    });
  }

  res.json(res.locals.data);
};

const middlewares = jsonServer.defaults();
const port = process.env.PORT || 9000;

// Bind the router db to the app
app.db = router.db;

app.use(middlewares);

// const rules = auth.rewriter({
//   users: 640,
//   teams: 660,
//   project: 660,
// });

//app.use(rules);
app.use(auth);
app.use(router);

server.listen(port);
