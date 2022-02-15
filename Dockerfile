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


FROM node:lts-alpine as build-stage2

WORKDIR /app

COPY --from=build-stage1 /app /app
COPY . .

ENV NODE_ENV production

RUN npm config set registry https://r.cnpmjs.org/ &&\
    npm run build &&\
    # fix js error in IE
    sed -i 's/catch{}/catch(e){}/g' `grep 'catch{}' -rl ./*` &&\
    npm prune --production


# production stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage2 /app/dist /var/www/html

COPY conf/ssl /etc/nginx/ssl
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY conf/nginx-site.conf /etc/nginx/conf.d/default.conf
COPY conf/nginx-site-ssl.conf /etc/nginx/conf.d/default-ssl.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
