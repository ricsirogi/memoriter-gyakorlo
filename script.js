const url = 'https://raw.githubusercontent.com/ricsirogi/memoriter-gyakorlo/refs/heads/main/poems.json';
let poems = {}


let blankPercentInput = document.getElementById("blank-percent-input");
let nextButton = document.getElementById("next-button");
let checkButton = document.getElementById("check-button");
let poemDiv = document.getElementById("poem");
let authorP = document.getElementById("author");
let titleP = document.getElementById("title");
let poemTextDiv = document.getElementById("poem-text");
let spacerDiv = document.getElementById("spacer-div")
let checkboxContainer = document.getElementById("options-div");

const DEFAULT_BLANK_PERCENT = 15;
const BLANK_PERCENT_MIN = 5;
const BLANK_PERCENT_MAX = 90;

let poemData = {}
let words = [] // in this list the blank words will be replaced with "___"
let originalWords = [] // In this list every word is present, but they are stripped from any non-letter characters
let blankedIndexes = [] // Indexes of the words that are blanked out
let displayedPoem = ""
let blankWordInputs = []
let poemCheckboxes = {}

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
        });
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

            poemCheckboxes[poem] = poemCheckbox;
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

nextButton.addEventListener("click", () => {
    generateRandomPoem()
    makePoem()
    console.clear();
    console.log(words)
    console.log(originalWords)
})

fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => {
        poems = data;
        createCheckboxes()
        console.log("checkboxes created, heres the thing", poemCheckboxes)
        generateRandomPoem();
        makePoem()
        console.log(words)
        console.log(originalWords)

        spacerDiv.style.width = checkboxContainer.style.width
        console.log("a", checkboxContainer.style)
    })
    .catch(error => console.error('Error fetching the poems:', error));

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

    poemTextDiv.innerHTML = "";
    authorP.innerText = poemData.poet;
    titleP.innerText = poemData.title;

    let fromIndex = 0;
    for (let i = 0; i < words.length; i++) {
        if (words[i] === "\n") {
            let line = generateLine(words.slice(fromIndex, i), fromIndex);
            poemTextDiv.appendChild(line);
            fromIndex = i + 1; // Move to the next word after the newline
        }
    }
    // Process the last line if there is no trailing newline
    if (fromIndex < words.length) {
        let line = generateLine(words.slice(fromIndex), fromIndex);
        poemTextDiv.appendChild(line);
    }
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
    console.log("at randomPoem(), this is checkboxes", poemCheckboxes)
    while (title === "" || !poemCheckboxes[title].checked) {
        poet = poets[Math.floor(Math.random() * poets.length)];
        titles = Object.keys(poems[poet]);
        title = titles[Math.floor(Math.random() * titles.length)];
    }
    let poem = poems[poet][title];
    return { poet, title, poem };
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

