# build stage
FROM node:lts-alpine as build-stage1

WORKDIR /app

COPY package.json ./package.json

RUN npm config set registry https://registry.npm.taobao.org \
    && npm install vue-touch@next -S \
    && npm install amfe-flexible -S \
    && npm install postcss-px2rem -S \
    && npm install better-scroll -S \
    && npm install axios -S \
    && npm install @vue/cli-service -S \
    && npm install

# production stage
FROM nginx:stable-alpine as production-stage

COPY conf/ssl /etc/nginx/ssl
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/nginx-site.conf /etc/nginx/conf.d/default.conf
COPY conf/nginx-site-ssl.conf /etc/nginx/conf.d/default-ssl.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
