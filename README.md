# Hubilo API Script
This Node.js script is designed to interact with the Hubilo API to perform various tasks. It allows you to access and manipulate data related to an event on the Hubilo platform. The script can perform actions like bookmarking users, rating sessions, adding notes to users, and deleting notes.

## Prerequisites
Before using this script, make sure to set up the following:

1. Node.js: Ensure you have Node.js installed on your system.
2. Hubilo API Authentication: You need to obtain an authentication token for the Hubilo API and set it in a .env file. Refer to the Hubilo API documentation to obtain your token (open the network tab on your browser when you are logged and did you navigated the codemotion event platform website).

## Getting Started
1. Clone this repository to your local machine.
2. Navigate to the directory containing this script.
3. Create a .env file and set your Hubilo API authentication key as follows:

```HUBILO_AUTH=your_api_key_here```

4. Open a terminal in the script directory and run the following commands:

```npm install```

This installs the required Node.js packages.

## Usage
You can run the script with different modes based on your desired action. Replace mode with one of the following values:

- bookmark: Bookmark users on Hubilo.
- rate: Rate sessions on Hubilo.
- notes: Add notes to users on Hubilo.
- notes-delete: Delete notes from users on Hubilo.


### Example usage:
```
node script.js bookmark
node script.js rate
node script.js notes "Your message here"
node script.js notes-delete
```

## Notes Loop Mode
In the "notes" mode, you can use an additional argument to enter "loop" mode, which will continuously add notes to users at regular intervals.

### Example usage for loop mode:
```node script.js notes loop "Your message here"```

In loop mode, notes will be added to users at intervals of 2 seconds.

#### Note: Be cautious when using loop mode to avoid excessive API requests.

## Script Structure
- The script defines a HubiloAPI class that encapsulates API interactions.
- It provides methods for retrieving speakers, attendees, leaderboard users, sessions, bookmarking users, rating sessions, adding notes, and removing notes.
- It checks the selected mode and executes the corresponding action.
- The script can run in different modes, such as bookmarking users, rating sessions, adding notes, or deleting notes.
- The verbose variable can be set to true for additional logging.

Feel free to modify and extend this script to suit your specific requirements.