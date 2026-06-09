const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const uri = "mongodb+srv://jaywani22_db_user:VpCCMDG80Y4MdUib@cluster0.c86bvf1.mongodb.net/portfolio?retryWrites=true&w=majority";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("Connected successfully to SRV using Google DNS!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err.message);
    process.exit(1);
  });
