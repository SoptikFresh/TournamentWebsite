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

## Requirements

- PHP 7.0 or higher
- Web server (Apache, Nginx, etc.)

## Usage

- Open the website in your browser.
- Manage players and brackets interactively.
- Data is saved and loaded via the PHP backend.

## License

MIT License
