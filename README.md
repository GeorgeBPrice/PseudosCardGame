# Card Shedding Game: Pusoy Dos Variant

A reimagined and variant version of the popular card-shedding game **Pusoy Dos**. This web-based game implements many of the traditional rules of Pusoy Dos while incorporating unique mechanics such as a custom deck and suit value order.

## 🚀 Features

-   **Single-Player Gameplay:** Play against a computer opponent featuring adaptive and defensive strategy.
-   **Card Shedding Mechanics:** Be the first player to get rid of all your cards to win!
-   **Specific Hand Types:** Play singles, pairs, or valid 5-card combinations (Straights, Full Houses).
-   **Dynamic Rounds:** Play progresses in tricks. The player who plays the highest valid hand wins the trick and leads the next.
-   **Drag-and-Drop Interface:** Easily select and play cards.
-   **Responsive Design:** Fully playable on desktop and mobile devices.
-   **Unit Tested:** Core AI logic is verified with unit tests using Jest.

## 📖 Rules Overview

The game borrows elements from **Pusoy Dos** but follows these specific rules:

1.  **Objective**: Be the first player to shed all cards from your hand.
2.  **Gameplay**:
    *   Players are dealt 10 cards each.
    *   The first player of the game must lead with a single card.
    *   Subsequent players take turns playing a hand of the *same type* (single, pair, 5-card) but of a higher rank to beat the previous play on the table.
    *   If a player cannot (or chooses not to) beat the previous play, they must draw one card from the deck (if available) and pass their turn. The round continues with the next player, or the last player to play leads again if everyone else passes/draws.
    *   The player who plays the highest hand in a trick wins that trick and leads the next trick with any valid hand type (single, pair, 5-card).
3.  **Deck and Card Values**:
    *   Deck: Standard 52-card deck.
    *   Suit hierarchy (ascending): ♠ (lowest), ♣, ♦, ♥ (highest). Used for tie-breaking singles and pairs of the same rank.
    *   Card rank hierarchy (ascending): 2, 3, ..., 10, J, Q, K, A (highest).
4.  **Valid Hand Types**:
    *   **Single:** One card. Beats a lower-ranked single, or a same-ranked single with a lower suit.
    *   **Pair (Doubles):** Two cards of the same rank. Beats a lower-ranked pair. If ranks are equal, the pair containing the higher suit wins.
    *   **Five-Card Hands:** Must follow the type played previously (if any).
        *   **Straight:** 5 cards of sequential rank (suits don't matter). Ace can be high (10-J-Q-K-A) or low (A-2-3-4-5). Highest rank card determines the strength. Higher suit of the highest card breaks ties.
        *   **Full House (Triple + Pair/Two Random):** 3 cards of one rank and 2 cards of another rank (or any other 2 cards as implemented). The rank of the three-of-a-kind determines strength. *(Note: Current implementation primarily supports Triple + 2 random lowest cards)*.
        *   *(Other 5-card hands like Flush, Four of a Kind, Straight Flush are not currently implemented as distinct playable hands)*.
5.  **Winning the Game**:
    *   The first player to shed all their cards is immediately declared the winner.

## 🛠️ Tech Stack

-   **Frontend**: React, Next.js, TypeScript
-   **State Management**: React Context API
-   **Styling**: Tailwind CSS (via MUI System & custom utilities)
-   **UI Components**: Material UI (MUI)
-   **Drag-and-Drop**: React DnD
-   **Testing**: Jest

## 📦 Installation

To run this project locally:

1.  Clone the repository:
    ```bash
    git clone https://github.com/georgebprice/PseudosCardGame.git
    cd Pseudos-CardGame
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to:
    ```
    http://localhost:3000
    ```
5.  Run tests:
    ```bash
    npm test
    ```

## 🎮 How to Play

1.  Click "Start Game". Cards will be dealt.
2.  If it's your turn, select card(s) by clicking on them in your hand. They will move to the staging area above your hand.
3.  Click the "Play Selected Cards" button to play your staged hand.
4.  Alternatively, drag cards from your hand to the central Play Area.
5.  Click cards in the staging area to return them to your hand.
6.  If you cannot or choose not to play, click the "Draw Card / Pass" button.
7.  The first player to empty their hand wins! Click "Play Again" to start a new game.

## 🤖 AI Strategy

The computer opponent uses the following logic:
-   Finds all valid plays (singles, pairs, straights, full houses) based on the last play.
-   Enforces game start rule (must play single).
-   Prioritizes playing 5-card hands over pairs, and pairs over singles when leading.
-   Defaults to playing the lowest-ranking valid option.
-   **Defensive Play:**
    -   If the player has 3 or fewer cards, plays its highest-ranking valid option.
    *   If the player has 4 or 5 cards, has a 50% chance to play its second-highest valid option.

## 🛠️ Planned Features & Improvements

-   **Refine 5-Card Hand Logic:** Implement standard Full House (3+2) finding and potentially Flushes, Four of a Kind, Straight Flushes with appropriate ranking.
-   **Advanced AI:** Improve AI "combo-breaking" decisions (e.g., deciding whether to break a pair to play a single) and card holding strategy.
-   **Multiplayer Mode**: Play against friends online or locally.
-   **UI/UX Enhancements**: Animations, improved visual cues, sound effects.
-   **Statistics**: Track wins, losses, and gameplay stats.

## 📧 Contact

For questions or suggestions, feel free to contact me:

-   GitHub: [GeorgeBPrice](https://github.com/GeorgeBPrice)
-   Email: ...
