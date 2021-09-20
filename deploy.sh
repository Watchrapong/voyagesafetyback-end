#!/bin/bash

pm2 stop voyage-safety  
pm2 delete voyage-safety
sudo npm install
PORT=8085 pm2 start server.js --name voyage-safety