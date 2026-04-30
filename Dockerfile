FROM node:18

WORKDIR /usr/src/app

COPY Backend/package*.json ./
RUN npm install --production

COPY Backend .

EXPOSE 8080

CMD ["npm", "start"]
