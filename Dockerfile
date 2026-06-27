FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

COPY . .

RUN rm -f ./nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
