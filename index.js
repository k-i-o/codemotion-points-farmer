const fetch = require('node-fetch');
require('dotenv').config()

const auth = process.env.HUBILO_AUTH;
const verbose = process.argv.length > 0 && (process.argv.includes("verbose") || process.argv.includes("v")) ? true : false;

async function makeRequest(url, data) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': auth
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });

    return await response.json();
}


class HubiloAPI {
    constructor() {
        this.auth = auth;
    }

    async getSpeakers() {
        const speakersData = {
            "payload": {
                "data": {
                    "language": 0,
                    "limit": 5000,
                    "sort": 1,
                    "page": 1,
                    "input": "",
                    "featured": false,
                    "categoryId": []
                }
            }
        };
        const response = await makeRequest('https://api-v2.hubilo.com/api/v2/event/speakers', speakersData);
        const speakerIds = response.success.data.speakers.map(speaker => speaker.speakerId);
        return speakerIds;
    }

    async getAttendees() {
        const attendeesData = {
            "payload": {
                "data": { 
                    "language": 0,
                    "page": 0,
                    "limit": 5000,
                    "sort": 0,
                    "input": "",
                    "filter": "0,0,0",
                    "isShowLoggedinUser": "NO",
                    "industryIds": "",
                    "intrestIds": "",
                    "attendeeIds": [""],
                    "wantOnlineAttendee": "NO",
                    "designation": "",
                    "organisationName": "",
                    "country": "",
                    "state": "",
                    "city": "",
                    "userProfileFields": {},
                    "sidebarId": "64be57b7affa9a64da34f8df,64be57b7affa9a64da34f8e1,65041e2aff125c360a48af9e,65041e3cff125c360b36a3b5,6512a265fac41765407ff8af,65159dbafac417486a6a305c,65159dc8fac41709c05d8141,65159dd8ff125c1344180861"
                }
            }
        };
        const response = await makeRequest('https://api-v2.hubilo.com/api/v2/attendee', attendeesData);
        const attendeeIds = response.success.data.attendees.map(attendee => attendee.Id);
        return attendeeIds;
    }

    async getLeaderboardUsers() {
        const leaderboardData = {
            "payload": {
                "data": {
                    "limit": 5000,
                    "topUsers": "false",
                    "currentPage": 0
                }
            }
        };
        
        const response = await makeRequest('https://api-v2.hubilo.com/api/v2/event/leaderboard', leaderboardData);

        const leaderboardIds = response.success.data.leaderBoardUsers.map(user => user.userId);

        return leaderboardIds;
    }

    async getSessions() {
        const sessionsData = {
            "payload": {
                "data": {
                    "time_zone": "Europe/Rome",
                    "custom_tag": [],
                    "agenda_id": "",
                    "speakerIds": [],
                    "track_date": "",
                    "search": "",
                    "isSendLiveAgenda": "NO",
                    "trackIds": [],
                    "hasAddDate": true
                }
            }
        };
        
        const response = await makeRequest('https://api-v2.hubilo.com/api/v2/sessions/get-sessions', sessionsData);

        const sessions = response.success.data.sessions;

        return sessions;
    }

    async bookmarkUsers(userIds) {
        const bookmarkData = {
            "payload": {
                "data": {
                    "moduleType": "ATTENDEES",
                }
            }
        };

        for (const userId of userIds) {
            bookmarkData.payload.data.moduleId = userId;
            await makeRequest('https://api-v2.hubilo.com/api/v2/bookmark/add', bookmarkData);
        }
    }

    async rateSessions() {
        const sessions = await this.getSessions();

        const rateData = {
            "payload": {
                "data": {
                    "type": "SCHEDULE",
                    "rating": 5,
                    "source": "Session", 
                    "is stream": "No"
                }
            }
        };

        for (const session of sessions) {
            rateData.payload.data.typeId = session.agenda_id;
            rateData.payload.data.sessionId = session.agenda_id;
            rateData.payload.data.sessionName = session.title;
            await makeRequest('https://api-v2.hubilo.com/api/v2/rating/add', rateData);
        }
    }

    async addNotes(message) {
        const usersId = await this.getLeaderboardUsers();

        const noteData = {
            "payload": {
                "data": {
                    "note_type": "ATTENDEES",
                    "note": message,
                }
            }
        };

        for (const userId of usersId) {
            noteData.payload.data.noted_id = userId;
            await makeRequest('https://api-v2.hubilo.com/api/v2/notes/add', noteData);
            if(verbose)
                console.log("Note added on user " + userId);
        }
    }

    async removeNotes() {
        const usersId = await this.getLeaderboardUsers();

        const noteData = {
            "payload": {
                "data": {
                    "note_type": "ATTENDEES",
                    "isdelete": true,
                    "note": "",
                    "target": ""
                }
            }
        };

        for (const userId of usersId) {
            noteData.payload.data.note_id = userId;
            await makeRequest('https://api-v2.hubilo.com/api/v2/note/add', noteData);
        }
    }
}

const hubiloAPI = new HubiloAPI();
const mode = "notes"; // Replace with the desired mode (bookmark, rate, notes, notes-delete)
console.log("Running in mode: " + mode);

(async () => {
    switch (mode) {
        case "bookmark":
            // array = await hubiloAPI.getAttendees();
            // array = await hubiloAPI.getSpeakers();
            let brothers = await hubiloAPI.getLeaderboardUsers();
            
            await hubiloAPI.bookmarkUsers(brothers);
            break;
        case "rate":
            await hubiloAPI.rateSessions();
            break;
        case "notes":
            if (process.argv.length > 0) {
                const mode = process.argv[2];
                const message = process.argv[3] || "test";
                console.log("Adding note: " + message);

                if(mode === "loop"){
                    console.log("Looping the adding notes");
                    let i = 0;
                    setInterval(async () => {
                        await hubiloAPI.addNotes(message);
                        i++;
                        console.log("Note added on all users, loop number " + i);
                    }, 2000);
                }
            } else {
                const message = process.argv[2] || "test";

                console.log("No args, adding a note with the message '" + message + "'");
                await hubiloAPI.addNotes(message);
            }

            break;
        case "notes-delete":
            await hubiloAPI.removeNotes();
            break;
        default:
            console.log("Invalid mode");
    }

})();

