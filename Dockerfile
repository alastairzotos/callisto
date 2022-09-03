FROM node:14-slim

WORKDIR /usr/src/app

ARG REACT_APP_PROD
ENV REACT_APP_PROD $REACT_APP_PROD

ARG REACT_APP_WEATHER_API_KEY
ENV REACT_APP_WEATHER_API_KEY $REACT_APP_WEATHER_API_KEY

RUN cd apps/callisto

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm i -g serve

CMD ["serve", "-s", "./build"]
