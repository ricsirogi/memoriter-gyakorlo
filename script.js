const url = 'https://raw.githubusercontent.com/ricsirogi/memoriter-gyakorlo/refs/heads/main/poems.json';
let poems = {}

let poemDiv = document.getElementById("poem");
let authorP = document.getElementById("author");
let titleP = document.getElementById("title");
let poemTextDiv = document.getElementById("poem-text");


fetch(url)
    .then(response => {
        return response.json();
    })
    .then(data => {
        poems = data;
        console.log(poems)
        generateRandomPoem();
        displayPoem()

        console.log(displayedPoem);
    })
    .catch(error => console.error('Error fetching the poems:', error));



function generateRandomPoem() {
    poemData = randomPoem();
    words = getWords(poemData.poem);
    blankedIndexes = generateBlankedWords(words, 50); // Example blank count
    displayedPoem = makeDisplayPoem(words);
}

function displayPoem() {
    authorP.innerText = poemData.poet;
    titleP.innerText = poemData.title;
    poemTextDiv.innerText = displayedPoem;
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
            word += char;
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

