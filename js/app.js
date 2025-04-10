/*****************************
 *  LOGIN FUNCTIONS
 ******************************/
document.cookie = "name=value; SameSite=Strict; Secure";

function login(userInfo = {}) {
    let { email, department } = userInfo;
    if (!email || !department) {
        return;
    }

    setCookie(emailCookie, email);
    setCookie(departmentCookie, department);
    hideLoginModal();

    // this sure would be a great place to handle any identification stuff
    pendo.initialize({
        visitor: {
            id: email, // Required if user is logged in
            email: email, // email:        // Optional // role:         // Optional // You can add any additional visitor level key-values here, // as long as it's not one of the above reserved names.
            language: "ban"
        },
        account: {
            id: department, // Highly recommended
            name: department // name:         // Optional // planLevel:    // Optional // planPrice:    // Optional // creationDate: // Optional // You can add any additional account level key-values here, // as long as it's not one of the above reserved names.
        }
    });
}

const emailCookie = 'VISITOR-UNIQUE-ID';
const departmentCookie = 'ACCOUNT-UNIQUE-ID';

let email = getCookie(emailCookie);
let department = getCookie(departmentCookie);
let loginForm = $('#login');
loginForm.addEventListener('submit', function (submitEvent) {
    submitEvent.preventDefault();
    login(getLoginFormData());
});
$('#logout').addEventListener('click', logout);
function logout() {
    deleteCookie(emailCookie);
    deleteCookie(departmentCookie);
    showLoginModal();
}

// Login modal show/hide
if (email && department) {
    login({ email, department });
} else {
    showLoginModal();
}

function showLoginModal() {
    loginForm.style.opacity = 1;
    loginForm.style.top = '30%';
    setTimeout(() => (loginForm.style.display = ''), 100);
}
function hideLoginModal() {
    loginForm.style.opacity = 0;
    loginForm.style.top = '-100%';
    setTimeout(() => (loginForm.style.display = 'none'), 100);
}
function getLoginFormData() {
    return Array.from(loginForm.elements).reduce((form, { name, value }) => (name && (form[name] = value), form), {});
}

/*
 * Cookie helpers
 */
function setCookie(name, value, days) {
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}
function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

/*******************
 * LOCK STUFF
 *******************/
// ***
// Combination Lock
// ***

var combinationLock = {
    combination: 1234,
    locked: true,
    wheels: $('#combination input.digit').map((d) => parseInt(d.value) || 0), //[0, 0, 0, 0],
    increment: function (wheel) {
        if (this.wheels[wheel] === 9) {
            this.wheels[wheel] = 0;
        } else {
            this.wheels[wheel]++;
        }
    },
    decrement: function (wheel) {
        if (this.wheels[wheel] === 0) {
            this.wheels[wheel] = 9;
        } else {
            this.wheels[wheel]--;
        }
    },
    check: function () {
        if (this.combination === parseInt(this.wheels.join(''))) {
            this.locked = false;
        } else {
            this.locked = true;
        }
    },
    spin: function () {
        // randomize the wheels
        for (i = 0; i < 4; i++) {
            this.wheels[i] = getRandomInt(10, -1);
        }
    }
};
// ***
// Reusable Functions
// ***

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ***
// Presentation
// ***

// Increment buttons
var increments = document.getElementsByClassName('increment');

for (var i = 0; i < increments.length; i++) {
    increments[i].addEventListener('click', function () {
        let wheelIndex = parseInt(this.getAttribute('index'));
        combinationLock.increment(wheelIndex);
        document.querySelectorAll('.digit')[wheelIndex].value = combinationLock.wheels[wheelIndex];
        checkLock();
    });
}

// Decrement buttons
var decrements = document.getElementsByClassName('decrement');

for (var i = 0; i < decrements.length; i++) {
    decrements[i].addEventListener('click', function () {
        let wheelIndex = parseInt(this.getAttribute('index'));
        combinationLock.decrement(wheelIndex);
        document.querySelectorAll('.digit')[wheelIndex].value = combinationLock.wheels[wheelIndex];
        checkLock();
    });
}

// Keypress
var wheels = document.getElementsByClassName('digit');

for (var i = 0; i < wheels.length; i++) {
    wheels[i].addEventListener('keyup', function (e) {
        // arrow key up
        if (e.which === 38) {
            let wheelIndex = parseInt(this.getAttribute('index'));
            combinationLock.increment(wheelIndex);
            document.querySelectorAll('.digit')[wheelIndex].value = combinationLock.wheels[wheelIndex];
            checkLock();
        }

        // arrow key down
        if (e.which === 40) {
            let wheelIndex = parseInt(this.getAttribute('index'));
            combinationLock.decrement(wheelIndex);
            document.querySelectorAll('.digit')[wheelIndex].value = combinationLock.wheels[wheelIndex];
            checkLock();
        }

        // number key (0 - 9)
        if (e.which > 47 && e.which < 58) {
            let wheelIndex = parseInt(this.getAttribute('index'));
            combinationLock.wheels[wheelIndex] = parseInt(document.querySelectorAll('.digit')[wheelIndex].value);
            checkLock();
        }

        // if number is longer than 1 digit
        if (this.value.length > 1) {
            this.value = 0;
        }

        // if number is less that 1 digit
        if (this.value.length < 1) {
            this.value = 0;
        }
    });
}

// Check lock
function checkLock() {
    combinationLock.check();
    if (combinationLock.locked === false) {
        document.querySelector('#indicator').classList.remove('locked');
        document.querySelector('#indicator').classList.add('unlocked');
        activatePank();
    } else {
        document.querySelector('#indicator').classList.add('locked');
        document.querySelector('#indicator').classList.remove('unlocked');
        deactivatePank();
    }
}

function activatePank() {
    $('#the-button').addEventListener('click', celebrate);
}
function deactivatePank() {
    $('#the-button').removeEventListener('click', celebrate);
}
function celebrate() {
    document.location.href = 'celebrate.html';
}

// Helper function for dom querying
function $(selector) {
    let results = Array.from(document.querySelectorAll(selector));
    if (results.length === 1) {
        return results[0];
    } else {
        return results;
    }
}

let shownHint = false;
$('#hint').addEventListener('click', (evt) => {
    if (shownHint) {
        alert(`The combination is 1-2-3-4`);
    } else {
        alert(`That's the kinda thing an idiot would have on his luggage!`);
        shownHint = true;
        evt.target.innerText = 'ANSWER?';
    }
});
