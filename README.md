# Kavi-ET

A simple local expense tracker built with HTML, CSS, and JavaScript.

## How to start locally

1. Open a terminal in this folder.
2. Run one of the following commands:
   - Windows Python launcher:
     ```bash
     py -3 -m http.server 8000
     ```
   - If Python is available as `python`:
     ```bash
     python -m http.server 8000
     ```
3. Open your browser and go to:
   ```text
   http://localhost:8000/
   ```

## How to run in Docker

1. Build the Docker image:
   ```bash
   docker build -t kavi-et .
   ```
2. Run the container:
   ```bash
   docker run --rm -p 8000:80 kavi-et
   ```
3. Open your browser and go to:
   ```text
   http://localhost:8000/
   ```

## What the app does

- Add expenses with amount, description, category, and date
- View a dashboard with total spent and monthly total
- See a pie chart of spending by category
- Delete expenses or clear all data
- Store data locally in your browser

## Notes

- The app runs fully locally and does not require a database or backend.
- Your expenses are saved in your browser's local storage.
- If you open the app in a different browser or clear browser storage, your saved data may be lost.
