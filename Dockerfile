FROM node:8.10-slim

EXPOSE 3000

WORKDIR /rhtodo

ADD package.json package-lock.json ./
RUN npm install

ADD tsconfig.json .
ADD src src
RUN npm run build

ENV NODE_OPTS=
USER nobody
CMD exec node $NODE_OPTS dist/main.js
