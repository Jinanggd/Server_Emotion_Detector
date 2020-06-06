FROM node:latest

MAINTAINER Lie Jin Wang
LABEL authors="Lie Jin Wang (lie9762@gmail.com or lie.jin01@estudiant.upf.edu)"
LABEL version="1.0"
LABEL description="Emotion Detector Server which stores the duration of each emotion at REDIS"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


CMD ["npm", "start"]

