document.addEventListener('DOMContentLoaded', (event) => {
    const savedUsername = localStorage.getItem('username');
    const savedGroup = localStorage.getItem('groupId');
    if (savedUsername) {
        // Logic to update UI, such as displaying the user screen
        document.getElementById('registration_form').style.display = 'none';
        document.getElementById('user_screen').style.display = 'block';
        document.getElementById('user_name').innerText = savedUsername;
//        document.getElementById('group_id').innerText = savedGroup;
        document.getElementById('selected_group_id').innerText = savedGroup;
    }
});

function showAdminPanel() {
    document.getElementById('admin_panel').style.display = 'block';
    document.getElementById('show_admin_panel_button').style.display = 'none';
}

function hideAdminPanel() {
    document.getElementById('admin_panel').style.display = 'none';
    document.getElementById('show_admin_panel_button').style.display = 'block';
}

function registerUser() {
    const username = document.getElementById('username').value;

    // Basic validation
    if (!username) {
//        alert('Please enter a username');
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
//            alert(`User registered: ${data.username}`);
            document.getElementById('user_name').innerText = data.username;
            localStorage.setItem('username', data.username)
            document.getElementById('registration_form').style.display = 'none';
            document.getElementById('user_screen').style.display = 'block';
        } else {
            alert('Registration failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while registering');
    });
}

function logoutUser() {
    const username = localStorage.getItem('username');
    fetch('/logout_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Clear data from localStorage
            localStorage.removeItem('username');
            localStorage.removeItem('groupId');

            // Logic to hide user screen and show login form
            document.getElementById('user_screen').style.display = 'none';
            document.getElementById('registration_form').style.display = 'block';
        } else {
            alert('Failed to log out');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while logging out');
    });
}

function createGroup() {
    const new_group_id = document.getElementById('new_group_id').value;

    // Basic validation
    if (!new_group_id) {
        alert('Please enter a name for your group');
        return;
    }

    fetch('/create_group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `new_group_id=${encodeURIComponent(new_group_id)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const groupId = data.new_group_id;
//            alert(`Group created successfully. Group ID: ${groupId}`);
            // Optionally update the group_id field for convenience
            document.getElementById('group_id').value = new_group_id;
        } else {
            alert('Failed to create group');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the group');
    });
}

function joinGroup() {
    const groupId = document.getElementById('group_id').value;
    const username = document.getElementById('username').value;
    registerUser()

    // Basic validation
    if (!groupId || !username) {
        alert('Please enter both a group ID and a username');
        return;
    }

    fetch('/join_group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `group_id=${encodeURIComponent(groupId)}&username=${encodeURIComponent(username)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
//            alert(`Joined group ${groupId} successfully. Current members: ${data.users.join(', ')}`);
            document.getElementById('group_id').innerText = data.group_id;
            localStorage.setItem('groupId', data.group_id)
            updateGroupDisplay(groupId, data.users)
        } else {
            alert(data.message || 'Failed to join group');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while trying to join the group');
    });
}


function randomMatch() {
    const selected_group_id = localStorage.getItem('groupId');
//    const group_id = document.getElementById('selected_group_id').value;

    fetch('/random_match', {
        method: 'POST',
//        headers: {
//            'Content-Type': 'application/x-www-form-urlencoded',
//        },
//        body: `group_id=${encodeURIComponent(selected_group_id)}`
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ group_id: selected_group_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const matchedUsers = data.matched_users;
            if (matchedUsers.length > 0) {
                alert(`Matched Users: ${matchedUsers.join(', ')}`);
            } else {
                alert('Not enough users in the group for a match.');
            }
        } else {
            alert(data.message || 'Random match failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during the random match request');
    });
}

function updateGroupDisplay(groupId, members) {
    document.getElementById('selected_group_id').innerText = groupId;
    document.getElementById('group_members').innerText = members.join(', ');
}

// Timer
let timer;
let timeLeft;
let isTimerRunning = false;

function startTimer() {
//    TODO: implement as a Web Worker (https://chat.openai.com/g/g-HMNcP6w7d-data-analysis/c/4e9ebd32-ddcc-447c-9334-f551d5ae3494)
//    https://chat.openai.com/g/g-HMNcP6w7d-data-analysis/c/4e9ebd32-ddcc-447c-9334-f551d5ae3494#:~:text=1.%20Create%20a%20Web%20Worker
    if (isTimerRunning) return;
    const minutes = parseInt(document.getElementById('time_input').value);
    if (!minutes || minutes < 1 || minutes > 180) {
        alert("Please enter a number between 1 and 180.");
        return;
    }
    timeLeft = minutes * 60;
    timer = setInterval(updateTimer, 1000);
    isTimerRunning = true;
}

function updateTimer() {
    if (timeLeft <= 0) {
        clearInterval(timer);
        document.getElementById('time_display').innerText = "00:00:00";
        playSound();
        isTimerRunning = false;
        return;
    }
    timeLeft--;
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    document.getElementById('time_display').innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pauseTimer() {
    clearInterval(timer);
    isTimerRunning = false;
}

function resetTimer() {
    clearInterval(timer);
    document.getElementById('time_display').innerText = "00:00:00";
    isTimerRunning = false;
}

function playSound() {
    const sound = document.getElementById('timer_sound');
    sound.play();
}

function pad(number) {
    return number < 10 ? '0' + number : number;
}
