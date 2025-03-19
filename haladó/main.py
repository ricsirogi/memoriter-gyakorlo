import random
import json
import os

poems = {}

with open("poems.json", "r", encoding="utf-8") as file:
    poems = json.load(file)


def random_poem() -> tuple[str, str, str]:
    poet = random.choice(list(poems.keys()))
    title = random.choice(list(poems[poet].keys()))
    poem = poems[poet][title]
    return (poet, title, poem)


def get_words(poem: str) -> list[str]:
    words = []
    word = ""
    for count, char in enumerate(poem):
        if char == "\n":
            words.append(word)
            word = ""
            words.append("\n")
            continue

        if char != " ":
            word += char
        elif poem[count - 1] == " " or poem[count + 1] == " ":
            word += char
        else:
            words.append(word)
            word = ""
    words.append(word)  # append the last word

    # This /vs/ stuff is here in case I want to do something else with the verses in the future, but right now I could
    # just ctrl + h replace every /vs/ with a \n in the json
    for index, word in enumerate(words):
        if word[-4:] == "/vs/" and word != "/vs/":
            words[index] = word[:-4]
            words.insert(index + 1, "\n")
    return words


def make_display_poem(words: list[str]) -> str:
    return " " + " ".join(words)


def generate_blanked_words() -> list[int]:
    changed_indexes = []

    while len(changed_indexes) != blank_count:
        index = random.randint(0, len(words) - 1)
        if words[index] != "\n" and index not in changed_indexes:
            words[index] = "/num/" + "_" * 3
            changed_indexes.append(index)

    count = 1
    for index, word in enumerate(words):
        if word[:5] == "/num/":
            words[index] = f"({count})___"
            count += 1

    return changed_indexes


def display_stuff():
    os.system('cls' if os.name == 'nt' else 'clear')
    print("***** Memoriter poems guessing game *****")
    print(f"{poet}: {title}")
    print()
    print(display_poem)


BLANK_PERCENT = 10
poet, title, poem = random_poem()
og_words = get_words(poem)
words = og_words.copy()

blank_count = int((len(words) - poem.count("\n")) * BLANK_PERCENT / 100)

changed_indexes = generate_blanked_words()
changed_indexes.sort()

display_poem = make_display_poem(words)

display_stuff()

# Make a game where the user has to guess the words in the poem

to_guess = [i+1 for i in range(blank_count)]
while words != og_words:
    guessed_indexes = []
    for current, index in enumerate(changed_indexes):
        guess = input(f"Guess word ({to_guess[current]}): ")
        if guess == og_words[index]:
            words[index] = og_words[index]
            guessed_indexes.append(current)
            display_poem = make_display_poem(words)
            display_stuff()
            print("Your guess is correct!")
        elif guess == "forfit":
            break
        else:
            display_poem = make_display_poem(words)
            display_stuff()
            print(guess, "is incorrect, try again.")

    for index in sorted(guessed_indexes, reverse=True):
        changed_indexes.pop(index)
        to_guess.pop(index)

if guess == "forfit":
    print("The poem was:\n" + display_poem)
    print("Better luck next time!")
else:
    print("Congratulations! You guessed all the words correctly!")
