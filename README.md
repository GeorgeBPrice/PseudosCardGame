# Card Shedding Game: Pusoy Dos Variant

A reimagined and variant version of the popular card-shedding game **Pusoy Dos**. This web-based game implements many of the traditional rules of Pusoy Dos while incorporating unique mechanics such as a custom deck and suit value order.

## 🚀 Features

- **Single-Player Gameplay:** Play against a computer opponent with adaptive decision-making.
- **Card Shedding Mechanics:** Get rid of all your cards before your opponent does to win!
- **Custom Rules:** A unique deck and suit hierarchy with strategic gameplay inspired by Pusoy Dos, or Pseudos.
- **Dynamic Rounds:** Play single or doubles in rounds and respond strategically to your opponent's moves.
- **Responsive Design:** Fully playable on desktop and mobile devices.

## 📖 Rules Overview

The game borrows elements from **Pusoy Dos** but introduces its own unique flavor:

1. **Objective**: Be the first player to shed all your cards.
2. **Gameplay**:
   - Players take turns playing one card, doubles, or a hand of 5, to beat the previous play.
   - If a player cannot (or chooses not to) beat the play, they must draw a card.
   - The player who wins the round can start the next round with any allowed card combination they choose.
3. **Deck and Suit Values**:
   - Deck: Standard 52-card deck.
   - Suit hierarchy (ascending): ♠ (lowest), ♣, ♦, ♥ (highest).
   - Card rank hierarchy (ascending): 2, 3, ..., 10, J, Q, K, A.
4. **Winning a Round**:
   - A round is won when one player cannot beat the other's play.
   - The winner may play any card(s) to start the next round.
5. **Winning the Game**:
   - The first player to shed all their cards is declared the winner, the turns end immediately at this point.

## 🛠️ Tech Stack

- **Frontend**: React, Next.js, TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Drag-and-Drop**: React DnD (for card interactions)

## 📦 Installation

To run this project locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/georgebprice/PseudosCardGame.git
   cd Pseudos-CardGame
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🎮 How to Play

1. Start the game and draw your initial hand.
2. Take turns playing cards to beat your opponent.
3. Win rounds and strategically decide whether to play high-value cards or save them for future rounds.
4. Shed all your cards to win the game!

## 🛠️ Planned Features

- **Additional Rules from Pusoy Dos**: Incorporating more traditional rules for added depth.
- **Multiplayer Mode**: Play against friends online or locally.
- **Improved AI**: Enhance computer decision-making for challenging gameplay.
- **Statistics**: Track wins, losses, and gameplay stats.

## 📧 Contact

For questions or suggestions, feel free to contact me:

- GitHub: [GeorgeBPrice](https://github.com/GeorgeBPrice)
- Email: ...
