// const https=require('https')
const http = require("http");
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const Session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(Session);

const mongoose = require('mongoose');
const AuthRoutes = require('./Routes/Auth/Auth');
const AdminRoutes=require('./Routes/Admin/Admin')
// Rvgo
// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/srv749425.hstgr.cloud/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/srv749425.hstgr.cloud/fullchain.pem"),
// };

// Buzz
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/srv1295924.hstgr.cloud/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/srv1295924.hstgr.cloud/fullchain.pem"),
};
const mongoUrl = process.env.DbUrl; 
const Store = new MongoDbStore({
   uri: mongoUrl,
   collection: 'session',
   expiresAfterSeconds: 1576800000,
   logicalSessionTimeoutMinutes: 26298000,
});


app.use(Session({
   secret: 'My_Secret',
   resave: false,
   saveUninitialized: true,
   store: Store
}));

app.use(bodyParser.json({ limit: '150mb' }));

app.use(cors({
   origin: '*',
   credentials: true
})
);
app.use(Session({
   secret: 'My_Secret',
   resave: false, saveUninitialized: true,
   store: Store,
   cookie: {
      maxAge: 3600000 * 24 * 14,
      logicalSessionTimeoutMinutes: 3600000 * 24 * 14,
   }
}));
app.use(AuthRoutes)
app.use(AdminRoutes)
app.use('/QAUploads', express.static(path.join(__dirname, 'QAUploads')));
app.use('/Images', express.static(path.join(__dirname, 'Images')));

// mongoose.connect(mongoUrl)
//    .then(result => {
//        https.createServer(options,app)
//       .listen(3008);
//       console.log("connected to db and terminal at 3008");
//       console.log("Running on Node.js version:", process.version);
//    })

mongoose
.connect(mongoUrl)
.then(() => {
const PORT = 3008;
http.createServer(app).listen(PORT, () => {
console.log(`HTTP server running on port ${PORT}`);
console.log("connected to db");
console.log("Running on Node.js version:", process.version);
});
})
.catch(err => {
console.error("Mongo connection error:", err);
});

// const https = require('https')
// const express = require('express');
// const app = express();
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const Session = require('express-session');
// const MongoDbStore = require('connect-mongodb-session')(Session);

// const mongoose = require('mongoose');
// const AuthRoutes = require('./Routes/Auth/Auth');
// const AdminRoutes = require('./Routes/Admin/Admin')

// const mongoUrl = process.env.DbUrl;
// const Store = new MongoDbStore({
//    uri: mongoUrl,
//    collection: 'session',
//    expiresAfterSeconds: 1576800000,
//    logicalSessionTimeoutMinutes: 26298000,
// });


// app.use(Session({
//    secret: 'My_Secret',
//    resave: false,
//    saveUninitialized: true,
//    store: Store
// }));

// app.use(bodyParser.json({ limit: '150mb' }));

// app.use(cors({
//    origin: '*',
//    credentials: true
// })
// );
// app.use(Session({
//    secret: 'My_Secret',
//    resave: false, saveUninitialized: true,
//    store: Store,
//    cookie: {
//       maxAge: 3600000 * 24 * 14,
//       logicalSessionTimeoutMinutes: 3600000 * 24 * 14,
//    }
// }));
// app.use(AuthRoutes)
// app.use(AdminRoutes)
// app.use('/QAUploads', express.static(path.join(__dirname, 'QAUploads')));
// app.use('/Images', express.static(path.join(__dirname, 'Images')));
// mongoose.connect(mongoUrl)
//    .then(result => {
//       app.listen(3008);
//       console.log("connected to db and terminal at 3008");
//    })




