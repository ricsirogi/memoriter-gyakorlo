const url = 'https://raw.githubusercontent.com/ricsirogi/memoriter-gyakorlo/refs/heads/main/poems.json';
let poems = {}

let poemDiv = document.getElementById("poem");
let authorP = document.getElementById("author");
let titleP = document.getElementById("title");
let poemTextDiv = document.getElementById("poem-text");
let nextButton = document.getElementById("next-button");


let poemData = {}
let words = [] // in this list the blank words will be replaced with "___"
let originalWords = [] // In this list every word is present, but they are stripped from any non-letter characters
let blankedIndexes = [] // Example blank count
let displayedPoem = ""

nextButton.addEventListener("click", () => {
    generateRandomPoem()
    makePoem()
})

fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => {
        poems = data;
        generateRandomPoem();
        //displayPoem()
        makePoem()
        console.log(displayedPoem);
        console.log(words.length, originalWords.length)
    })
    .catch(error => console.error('Error fetching the poems:', error));

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

function generateWordElement(word, index) {
    // Makes a word element which is either a span or an input field
    if (blankedIndexes.includes(index)) {
        let span = document.createElement("span");
        span.innerText = word;
        span.id = index;
        span.classList.add("poem-word");
        return span;
    } else {
        let span = document.createElement("span");
        span.innerText = word;
        span.id = index;
        span.classList.add("poem-word");
        return span;
    }
}

function generateRandomPoem() {
    poemData = randomPoem();
    words = getWords(poemData.poem);
    for (let i = 0; i < words.length; i++) {
        if (words[i] === "\n" || words[i] === "/vs/") {
            originalWords.push(words[i]);
        }
        originalWords.push((getBareWord(words[i])));
    }
    blankedIndexes = generateBlankedWords(words, 50); // Example blank count
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
    let poet = poets[Math.floor(Math.random() * poets.length)];
    let titles = Object.keys(poems[poet]);
    let title = titles[Math.floor(Math.random() * titles.length)];
    let poem = poems[poet][title];
    return { poet, title, poem };
}

function getWords(poem) {
    const words = [];
    let word = "";
    for (let i = 0; i < poem.length; i++) {
        const char = poem[i];
        if (char === "\n") {
            words.push(word);
            word = "";
            words.push("\n");
            continue;
        }
        if (char !== " ") {
            if (!checkStringForLetter(char)) {
                words.push(word);
                word = "";
                words.push(char)
            } else {

                word += char;
            }

        } else if (poem[i - 1] === " " || poem[i + 1] === " ") {
            word += char;
        } else {
            words.push(word);
            word = "";
        }
    }
    words.push(word); // append the last word

    // idk if I'm gonna use the information that it's the end of the verse, so I'm just gonne keep it for now
    for (let i = 0; i < words.length; i++) {
        if (words[i].endsWith("/vs/") && words[i] !== "/vs/") {
            words[i] = words[i].slice(0, -4);
            words.splice(i + 1, 0, "\n");
        }
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
            if (checkStringForLetter(words[index])) {
                words[index] = "_".repeat(3);
                changedIndexes.push(index);
            } else {
                wordParts = separateLettersFromNonLetters(words[index]);
                for (let i = 0; i < wordParts.length; i++) {
                    if (checkStringForLetter(wordParts[i])) {
                        words[index] = "_".repeat(3);
                    } else {
                        words[index] += wordParts[i];
                    }
                }
                changedIndexes.push(index);
            }
        }
    }
    changedIndexes.sort((a, b) => a - b);
    return changedIndexes;
}

