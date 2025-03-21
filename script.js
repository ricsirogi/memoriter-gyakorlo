const url = 'https://raw.githubusercontent.com/ricsirogi/memoriter-gyakorlo/refs/heads/main/poems.json';
let poems = {}


let blankPercentInput = document.getElementById("blank-percent-input");
let nextButton = document.getElementById("next-button");
let checkButton = document.getElementById("check-button");
let poemDiv = document.getElementById("poem");
let authorP = document.getElementById("author");
let titleP = document.getElementById("title");
let dateP = document.getElementById("year");
let poemTextDiv = document.getElementById("poem-text");
let spacerDiv = document.getElementById("spacer-div")
let checkboxContainer = document.getElementById("option-rows");
let selectAllOptionsButton = document.getElementById("select-all-options-button");

const DEFAULT_BLANK_PERCENT = 15;
const BLANK_PERCENT_MIN = 5;
const BLANK_PERCENT_MAX = 90;

let poemData = {}
let words = [] // in this list the blank words will be replaced with "___"
let originalWords = [] // In this list every word is present, but they are stripped from any non-letter characters
let blankedIndexes = [] // Indexes of the words that are blanked out
let displayedPoem = ""
let blankWordInputs = []
let poetCheckboxes = {}
let titleCheckboxes = {}
let allCheckboxesStatus = true // Used with the selectAllOptionsButton, so all checkboxes can be toggled on or off

let blankPercent = blankPercentInput.value

blankPercentInput.addEventListener("input", () => {
    blankPercent = blankPercentInput.value
})

checkButton.addEventListener("click", () => {
    for (let i = 0; i < blankWordInputs.length; i++) {
        let input = blankWordInputs[i]
        let correct = isInputCorrect(input)
        changeInputCorrectness(input, correct)
        input.value = originalWords[blankedIndexes[i]]

    }
    switchChecking(true)
})


nextButton.addEventListener("click", () => {
    generateRandomPoem()
    makePoem()
    console.clear();
    console.log(words)
    console.log(originalWords)
})

selectAllOptionsButton.addEventListener("click", () => {
    titleKeys = Object.keys(titleCheckboxes)
    for (let i = 0; i < titleKeys.length; i++) {
        let checkbox = titleCheckboxes[titleKeys[i]]
        let event = new Event('change');
        if (allCheckboxesStatus) {
            checkbox.checked = false
        }
        else {
            checkbox.checked = true
        }
        checkbox.dispatchEvent(event);
    }
    if (allCheckboxesStatus) {
        allCheckboxesStatus = false
    }
    else {
        allCheckboxesStatus = true
    }
})

window.addEventListener('load', () => {

    fetch(url)
        .then(response => {
            return response.json();
        })
        .then(data => {
            poems = data;
            createCheckboxes()
            loadCheckboxStatuses();
            generateRandomPoem();
            makePoem()
            console.log(words)
            console.log(originalWords)

            spacerDiv.style.width = checkboxContainer.getBoundingClientRect().width + "px"
        })
        .catch(error => console.error('Error fetching the poems:', error));
});



// Save checkbox statuses to localStorage
function saveCheckboxStatuses() {
    let statuses = { "poets": {}, "titles": {} };
    for (const [title, checkbox] of Object.entries(titleCheckboxes)) {
        statuses["titles"][title] = checkbox.checked;
    }
    for (const [poet, checkbox] of Object.entries(poetCheckboxes)) {
        statuses["poets"][poet] = checkbox.checked;
    }
    console.log('Saving statuses:', statuses); // Debugging log
    localStorage.setItem('checkboxStatuses', JSON.stringify(statuses));
}
// Load checkbox statuses from localStorage
function loadCheckboxStatuses() {
    let statuses = JSON.parse(localStorage.getItem('checkboxStatuses'));
    console.log('Loading statuses:', JSON.stringify(statuses, null, 2)); // Debugging log
    if (statuses) {
        for (const [title, checked] of Object.entries(statuses.titles)) {
            if (titleCheckboxes[title]) {
                titleCheckboxes[title].checked = checked;
            }
            console.log("checking titles")
        }
        for (const [poet, checked] of Object.entries(statuses.poets)) {
            if (poetCheckboxes[poet]) {
                poetCheckboxes[poet].checked = checked;
            }
            console.log("checking poets")
        }
    }
}

function getPoetCheckbox(poemCheckbox) {
    let parent = poemCheckbox.parentElement;
    while (parent) {
        let poetCheckbox = parent.querySelector(`input[type="checkbox"][id^="poet-"]`);
        if (poetCheckbox) {
            return poetCheckbox;
        }
        parent = parent.parentElement;
    }
    return null;
}

function getChildCheckboxes(parentCheckbox) {
    // Find the parent container of the parent checkbox
    let parentContainer = parentCheckbox.parentElement;
    while (parentContainer && !parentContainer.querySelector(`input[type="checkbox"][id^="poet-"]`)) {
        parentContainer = parentContainer.parentElement;
    }

    // If the parent container is found, get all child checkboxes
    if (parentContainer) {
        return Array.from(parentContainer.querySelectorAll(`input[type="checkbox"][id^="poem-"]`));
    }

    return [];
}

function areAllChildrenUnchecked(parent) {
    let checkboxes = getChildCheckboxes(parent);
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            return false;
        }
    }
    return true;
}

function areAllCheckboxesUnchecked() {
    poets = Object.keys(poems);
    for (let i = 0; i < poets.length; i++) {
        if (poetCheckboxes[poets[i]].checked) {
            return false;
        }
    }
    return true
}

function recheckIfAllUnchecked(checkbox) {
    // checks this checkbox, if all checkboxes are unchecked
    if (areAllCheckboxesUnchecked()) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
    }
}
function createCheckboxes() {
    checkboxContainer.innerHTML = ""; // Clear previous checkboxes

    let poets = Object.keys(poems);
    let half = Math.ceil(poets.length / 2);
    let leftColumn = document.createElement("div");
    let rightColumn = document.createElement("div");

    for (let i = 0; i < poets.length; i++) {
        let poet = poets[i];
        let poetCheckbox = document.createElement("input");
        poetCheckbox.type = "checkbox";
        poetCheckbox.id = `poet-${poet}`;
        poetCheckbox.checked = true;
        poetCheckbox.addEventListener("change", () => {
            let poemCheckboxes = poemsContainer.querySelectorAll(`input[id^='poem-${poet}-']`);
            poemCheckboxes.forEach(poemCheckbox => {
                poemCheckbox.checked = poetCheckbox.checked;
            });
            saveCheckboxStatuses();

            // if this is the last checkbox that was checked, then don't let be checked out, because the site will break
            recheckIfAllUnchecked(poetCheckbox)
        });
        poetCheckboxes[poet] = poetCheckbox;

        let poetLabel = document.createElement("label");
        poetLabel.htmlFor = `poet-${poet}`;
        poetLabel.innerText = poet;

        let poetContainer = document.createElement("div");

        poetContainer.appendChild(poetCheckbox);
        poetContainer.appendChild(poetLabel);

        let poemsContainer = document.createElement("div");
        poemsContainer.style.marginLeft = "20px";

        let poemNames = Object.keys(poems[poet]);
        for (let j = 0; j < poemNames.length; j++) {
            if (poemNames[j] === "dates") {
                continue;
            }
            let poem = poemNames[j];
            let poemCheckbox = document.createElement("input");
            poemCheckbox.type = "checkbox";
            poemCheckbox.id = `poem-${poet}-${poem}`;
            poemCheckbox.checked = true
            let poemLabel = document.createElement("label");
            poemLabel.htmlFor = `poem-${poet}-${poem}`;
            poemLabel.innerText = poem;

            let poemContainer = document.createElement("div");
            poemContainer.appendChild(poemCheckbox);
            poemContainer.appendChild(poemLabel);

            poemsContainer.appendChild(poemContainer);

            titleCheckboxes[poem] = poemCheckbox;
            poemCheckbox.addEventListener("change", () => {
                let parent = getPoetCheckbox(poemCheckbox)
                if (parent) {
                    parent.checked = !areAllChildrenUnchecked(parent);
                    saveCheckboxStatuses();
                }
                recheckIfAllUnchecked(poemCheckbox)
            })
        }

        poetContainer.appendChild(poemsContainer);

        if (i < half) {
            leftColumn.appendChild(poetContainer);
        } else {
            rightColumn.appendChild(poetContainer);
        }
    }

    checkboxContainer.appendChild(leftColumn);
    checkboxContainer.appendChild(rightColumn);
}

function isInputCorrect(input) {
    return input.classList.contains("correct")
}

function switchChecking(onOrOff) {
    for (let i = 0; i < blankWordInputs.length; i++) {
        if (onOrOff) { // Either every single word is checked or none of them
            if (blankWordInputs[i].classList.contains("checking")) { // If one is checked, all of them are checked
                break
            }
            blankWordInputs[i].classList.add("checking")
        } else {
            if (!blankWordInputs[i].classList.contains("checking")) {
                break
            }
            blankWordInputs[i].classList.remove("checking")
        }
    }
}

function makePoem() {
    // takes the current poem variables and generates the poem making divs for each line and spans for each word
    // returns the div containing the poem

    authorP.innerText = poemData.poet;
    titleP.innerText = poemData.title;
    dateP.innerText = poemData.date
    authorP.style.width = "auto";
    titleP.style.width = "auto";

    let authorPWidth = authorP.getBoundingClientRect().width
    let titleWidth = titleP.getBoundingClientRect().width

    let maxWidth = Math.max(authorPWidth, titleWidth);
    authorP.style.width = maxWidth + "px";
    titleP.style.width = maxWidth + "px";

    let tempDiv = document.createDocumentFragment();
    let fromIndex = 0;
    for (let i = 0; i < words.length; i++) {
        if (words[i] === "\n") {
            let line = generateLine(words.slice(fromIndex, i), fromIndex);
            tempDiv.appendChild(line);
            fromIndex = i + 1; // Move to the next word after the newline
        }
    }
    // Process the last line if there is no trailing newline
    if (fromIndex < words.length) {
        let line = generateLine(words.slice(fromIndex), fromIndex);
        tempDiv.appendChild(line);
    }
    // Replace the children instead of setting innerHTML (avoids flicker)
    poemTextDiv.replaceChildren(...tempDiv.childNodes);
}

function generateLine(words, index) {
    // takes an array of words that go into the line
    // also takes an index which will be the starting index of the first word
    // so if the first line had 5 words, you should call genearateLine(<your words>, 5)
    // returns a div containing the words in the line (as spans)
    let container = document.createElement("div");
    container.classList.add("poem-line");

    for (let i = 0; i < words.length; i++) {
        if (words[i] === "\n") {
            continue;
        }
        let wordElement = generateWordElement(words[i], index + i);
        container.appendChild(wordElement);
    }
    return container;
}

function changeInputCorrectness(input, correct) {
    if (correct) {
        input.classList.remove("wrong");
        input.classList.add("correct");
    } else {
        input.classList.remove("correct");
        input.classList.add("wrong");
    }
}
function generateWordElement(word, index) {
    // Makes a word element which is either a span or an input field
    if (blankedIndexes.includes(index)) {
        let input = document.createElement("input");
        input.type = "text";
        input.id = index;
        input.classList.add("poem-blank-word");
        input.classList.add("poem-word");
        input.classList.add("wrong");
        input.addEventListener("input", () => {
            if (input.value === originalWords[index]) {
                changeInputCorrectness(input, true)
            } else {
                changeInputCorrectness(input, false)
            }
            switchChecking(false)
        })
        blankWordInputs.push(input);
        return input;
    } else {
        let span = document.createElement("span");
        span.innerText = word;
        span.id = index;
        span.classList.add("poem-word");
        if (!checkStringForLetter(word)) {
            span.classList.add("non-letter");
        }
        return span;
    }
}

function generateRandomPoem() {
    blankWordInputs = []
    poemData = randomPoem();
    words = getWords(poemData.poem);
    originalWords = []
    for (let i = 0; i < words.length; i++) {
        if (words[i] === "\n") {
            originalWords.push(words[i]);
        } else {
            originalWords.push((getBareWord(words[i])));
        }
    }
    if (!(blankPercent >= BLANK_PERCENT_MIN && blankPercent <= BLANK_PERCENT_MAX)) {
        blankPercent = DEFAULT_BLANK_PERCENT;
        blankPercentInput.value = blankPercent;
    }
    blankedIndexes = generateBlankedWords(words, blankPercent); // Example blank count
    displayedPoem = makeDisplayPoem(words);
}

function displayPoem() {
    authorP.innerText = poemData.poet;
    titleP.innerText = poemData.title;
    poemTextDiv.innerText = displayedPoem;
}

function getBareWord(word) {
    let parts = separateLettersFromNonLetters(word);
    for (let i = 0; i < parts.length; i++) {
        if (checkStringForLetter(parts[i])) {
            return parts[i];
        }
    }
    return ""
}

function separateLettersFromNonLetters(str) {
    const result = [];
    let currentWord = '';

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (checkStringForLetter(char)) { // \p{L} matches any kind of letter from any language
            currentWord += char;
        } else {
            if (currentWord) {
                result.push(currentWord);
                currentWord = '';
            }
            if (result.length > 0 && !checkStringForLetter(result[result.length - 1])) {
                result[result.length - 1] += char;
            } else {
                result.push(char);
            }
        }
    }

    if (currentWord) {
        result.push(currentWord);
    }

    return result;
}

function checkStringForLetter(word) {
    // Returns whether there are only letters in the string
    return /^[\p{L}]+$/u.test(word);
}

function randomPoem() {
    let poets = Object.keys(poems);
    let poet = ""
    let titles = {}
    let title = ""
    let date = ""

    let count = 0
    while (title === "" || title === "dates" || !titleCheckboxes[title].checked) {
        if (count > 1000) {
            console.log("No poem found")
            break
        }
        poet = poets[Math.floor(Math.random() * poets.length)];
        titles = Object.keys(poems[poet]);
        title = titles[Math.floor(Math.random() * titles.length)];
        date = poems[poet]["dates"][title];

        count++
    }
    let poem = poems[poet][title];
    return { poet, title, poem, date };
}

function getWords(poem) {
    const words = [];
    let word = "";
    for (let i = 0; i < poem.length; i++) {
        const char = poem[i];
        if (char === "\n") { // make new line
            if (word) {
                words.push(word);
                word = "";
            }
            words.push("\n");
            continue;
        }
        if (char !== " ") {
            if (!checkStringForLetter(char)) {
                if (word) {
                    words.push(word);
                    word = "";
                }
                words.push(char)
            } else {
                word += char;
            }

        } else if (poem[i - 1] === " " || poem[i + 1] === " ") { // check indentation
            word += char;
        } else if (word) {
            words.push(word);
            word = "";
        }
    }
    if (word) {
        words.push(word); // append the last word
    }
    return words;
}

function makeDisplayPoem(words) {
    return " " + words.join(" ");
}


function generateBlankedWords(words, blankPercent) {
    const changedIndexes = [];
    const blankCount = Math.floor((words.length - words.filter(word => word === "\n" || !checkStringForLetter(word)).length) * blankPercent / 100) + 1;
    while (changedIndexes.length !== blankCount) {
        const index = Math.floor(Math.random() * words.length);
        if (words[index] !== "\n" && !changedIndexes.includes(index)) {
            if (checkStringForLetter(words[index])) { // If its just a word
                words[index] = "_".repeat(3);
                changedIndexes.push(index);
            }
        }
    }
    changedIndexes.sort((a, b) => a - b);
    return changedIndexes;
}

