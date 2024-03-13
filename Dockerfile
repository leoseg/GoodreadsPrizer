FROM node:20.8

WORKDIR /app
COPY . .
RUN npm install --omit=dev
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]