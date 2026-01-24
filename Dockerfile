# Use official PHP runtime with Apache
FROM php:8.2-apache

# Enable Apache modules
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy project files to container
COPY . /var/www/html/

# Create writable directories for data storage
RUN mkdir -p /var/www/html/php/data && \
    chown -R www-data:www-data /var/www/html/php && \
    chmod -R 755 /var/www/html/php

# Set permissions for the application
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Configure Apache to serve from root
RUN echo "DocumentRoot /var/www/html" > /etc/apache2/sites-available/000-default.conf && \
    sed -i 's|<Directory /var/www/html>|<Directory /var/www/html>|g' /etc/apache2/apache2.conf

# Expose port 8080 for Render
EXPOSE 8080

# Update Apache to listen on 8080
RUN sed -i 's/Listen 80/Listen 8080/g' /etc/apache2/ports.conf

# Start Apache
CMD ["apache2-foreground"]
