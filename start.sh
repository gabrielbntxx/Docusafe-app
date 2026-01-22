#!/bin/bash
npx prisma db push --skip-generate --accept-data-loss
node server.js
