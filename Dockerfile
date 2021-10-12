FROM node:14.16.1

WORKDIR /

ARG REPORT_INPUT

ENV ACTION_NAME='./actions-auditor/'

COPY $REPORT_INPUT .
COPY index.js .
COPY utils/ ./utils
COPY templateMappers/ ./templateMappers
COPY package.json .
COPY package-lock.json .

RUN npm install

ENTRYPOINT ["node", "/index.js"]
