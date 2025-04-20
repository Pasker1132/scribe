# Используем официальный образ PHP
FROM php:8.1-apache

# Копируем файлы проекта в контейнер
COPY . /var/www/html/

# Устанавливаем необходимые расширения PHP
RUN docker-php-ext-install pdo pdo_mysql

# Включаем модуль Apache rewrite
RUN a2enmod rewrite
