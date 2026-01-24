# TournamentWebsite

A simple web application for managing and displaying tournament brackets.

## Features

- Interactive tournament bracket management
- Player management
- Persistent data storage using JSON files
- PHP backend for data handling

## Project Structure

```
TournamentWebsite/
  bracket.js           # Frontend logic for bracket management
  index.html           # Main web page
  style.css            # Stylesheet
  php/
    auth.php           # Authentication logic
    bracket.json       # Bracket data storage
    load_bracket.php   # Loads bracket data
    players.json       # Player data storage
    save_bracket.php   # Saves bracket data
    update_players.php # Updates player data
```

## Getting Started

1. Clone the repository:
   ```sh
   git clone https://github.com/SoptikFresh/TournamentWebsite
   ```
2. Place the project on a PHP-enabled web server (e.g., XAMPP, WAMP, LAMP).
3. Access `index.html` via your browser.

## Installing PHP

### Windows

1. Download PHP from [php.net](https://www.php.net/downloads.php)
2. Extract the ZIP file to a folder (e.g., `C:\php`)
3. Add PHP to your system PATH:
   - Open Environment Variables (search "Environment Variables" in Start Menu)
   - Click "Edit the system environment variables"
   - Click "Environment Variables..." button
   - Under "System variables", select "Path" and click "Edit"
   - Click "New" and add the PHP folder path (e.g., `C:\php`)
   - Click OK on all dialogs
4. Verify installation by opening a new terminal and running:
   ```sh
   php -v
   ```

### macOS

Using Homebrew:

```sh
brew install php
```

### Linux

**Ubuntu/Debian:**

```sh
sudo apt-get update
sudo apt-get install php
```

**Fedora/RHEL:**

```sh
sudo dnf install php
```

## Running via PHP Built-in Server

You can quickly start the application using PHP's built-in web server:

```sh
php -S localhost:8000
```

Then open your browser and navigate to `http://localhost:8000` to access the application.

You can replace `8000` with any available port number if needed.

## Docker Setup (For Render Hosting)

This project includes Docker configuration for easy deployment on Render.

### Running Locally with Docker

1. Make sure Docker is installed on your system.
2. Build and run the container:

```sh
docker-compose up --build
```

3. Access the application at `http://localhost:8080`

### Deploying to Render

1. Push your project to GitHub (or any Git repository)
2. Create a new Web Service on [Render](https://render.com)
3. Connect your repository
4. Render will automatically detect the Dockerfile
5. Configure the following:
   - **Build Command:** (leave empty, Docker build is automatic)
   - **Start Command:** (leave empty, Docker start is automatic)
   - **Port:** 8080
6. Deploy and access your service via the provided URL

### Files Included for Docker

- `Dockerfile` - Container configuration with PHP 8.2 and Apache
- `docker-compose.yml` - Local development setup
- `render.yaml` - Render-specific configuration

## Requirements

- PHP 7.0 or higher (or Docker)
- Web server (Apache, Nginx, etc.) or Docker

## Usage

- Open the website in your browser.
- Manage players and brackets interactively.
- Data is saved and loaded via the PHP backend.

## License

MIT License
