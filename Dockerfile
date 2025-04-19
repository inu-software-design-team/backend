FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG MONGODB_URL
ENV MONGODB_URL=${MONGODB_URL}
CMD ["npm", "start"]