FROM node:14.16.1
COPY index.js package.json package-lock.json schemaTemplate.js ./
RUN npm install
ENTRYPOINT ["node", "/index.js"]

