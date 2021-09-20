const admin = require("firebase-admin");

const serviceAccount = require("./firebase_config.json");

const FirebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'feisty-tempo-311112.appspot.com'
});

module.exports = FirebaseApp;