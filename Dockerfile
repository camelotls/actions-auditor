FROM node:12.9.0

WORKDIR /

ARG REPORT_INPUT
ENV ACTION_NAME='./actions-npm-audit/'
ADD $REPORT_INPUT .
COPY index.js .
COPY utils/ ./utils
COPY templateMappers/ ./templateMappers
COPY package.json .
COPY package-lock.json .

RUN npm install

ENTRYPOINT ["node", "/index.js"]
