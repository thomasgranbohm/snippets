# Dependencies stage
FROM node:18 AS dependencies

RUN apt-get -y update && \
    apt-get -y install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

WORKDIR /home/node/app

COPY package.json package-lock.json ./

RUN npm ci

# Build stage
FROM node:18 AS build

RUN apt-get -y update && \
    apt-get -y install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

WORKDIR /home/node/app
COPY package.json package-lock.json tsconfig.json ./
COPY src/ ./src
COPY --from=dependencies /home/node/app/node_modules ./node_modules

ENV NODE_ENV production

RUN npm run build
RUN npm ci --production

# Start stage
FROM node:18
WORKDIR /home/node/app

ENV NODE_ENV production

COPY --from=build /home/node/app/dist ./dist
COPY --from=build /home/node/app/node_modules ./node_modules/
COPY --from=build /home/node/app/package.json ./package.json

EXPOSE 1337

CMD ["npm", "start"]