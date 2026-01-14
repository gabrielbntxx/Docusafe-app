#!/bin/bash
npx prisma migrate deploy
PORT=${PORT:-3000} next start -p ${PORT:-3000}
