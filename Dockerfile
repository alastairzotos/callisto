# FROM node:14-slim

# WORKDIR /usr/src/app

# ARG REACT_APP_PROD
# ENV REACT_APP_PROD $REACT_APP_PROD

# ARG REACT_APP_WEATHER_API_KEY
# ENV REACT_APP_WEATHER_API_KEY $REACT_APP_WEATHER_API_KEY

# RUN cd apps/callisto

# COPY apps/callisto/package*.json ./

# RUN npm ci

# COPY apps/callisto .

# RUN npm run build

# RUN npm i -g serve

# CMD ["serve", "-s", "./build"]

FROM node:14-slim
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY apps/callisto/package.json apps/callisto/package.json

# Add libs here
COPY libs/callisto/package.json libs/callisto/package.json

RUN yarn --frozen-lockfile

# Build
RUN yarn global add turbo
COPY turbo.json package.json yarn.lock ./
COPY apps/callisto apps/callisto
COPY libs libs
# RUN turbo run build --scope=callisto --include-dependencies

EXPOSE 3000
CMD yarn workspace callisto start