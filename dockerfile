FROM node:lts-alpine

WORKDIR /var/www

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8082

# Default command - can be overridden in docker-compose
CMD ["npm", "start"]