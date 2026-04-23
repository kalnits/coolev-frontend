FROM node:22-alpine

WORKDIR /app

COPY package.json tsconfig.json next-env.d.ts next.config.ts vitest.config.ts vitest.setup.ts ./
COPY app ./app
COPY components ./components
COPY lib ./lib

RUN npm install

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
