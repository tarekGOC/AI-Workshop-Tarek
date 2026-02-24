# Flashcard Study Application

## System Description
A study aid application that allows users to create decks of flashcards with questions and answers. Users can study using the flashcards, mark their confidence level, and track their learning progress. The application uses spaced repetition principles to prioritize cards the user finds difficult.

## System Constraints & Considerations
- **Data Persistence**: Flashcard data and progress must persist across application restarts
- **Input Validation**: All user inputs must be validated and sanitized
- **Spaced Repetition**: Cards marked as difficult appear more frequently
- **Single User**: Application operates in single-user mode (no authentication required)
- **Offline Operation**: Application must work without internet connectivity

---

## User Stories

### User Story 1: Create Flashcard Decks
**As a** user  
**I want to** create named decks to organize my flashcards by subject  
**So that** I can study different topics separately

**Acceptance Criteria:**
- [ ] Users can create a deck with a name (required, max 80 characters)
- [ ] Users can add an optional description to the deck (max 300 characters)
- [ ] Deck names must be unique
- [ ] System validates input to prevent injection attacks
- [ ] Each deck is assigned a unique identifier
- [ ] Timestamps are recorded for creation time
- [ ] Unit tests cover all validation scenarios
- [ ] Integration tests verify deck creation and persistence
- [ ] Test coverage must be at least 80%

### User Story 2: Add and Edit Flashcards
**As a** user  
**I want to** add flashcards with a question and answer to a deck  
**So that** I can build my study material

**Acceptance Criteria:**
- [ ] Users can add a card with a front (question, max 500 characters) and back (answer, max 1000 characters)
- [ ] Cards are assigned to a specific deck
- [ ] Users can edit existing cards
- [ ] All inputs are validated and sanitized
- [ ] Each card is assigned a unique identifier
- [ ] Modification timestamp is recorded
- [ ] Users see confirmation of successful creation or edit
- [ ] Unit tests cover all validation and creation scenarios
- [ ] Integration tests verify card-deck relationships
- [ ] Tests verify no injection vulnerabilities

### User Story 3: Study Flashcards
**As a** user  
**I want to** study cards in a deck by viewing the question and revealing the answer  
**So that** I can test my knowledge

**Acceptance Criteria:**
- [ ] Study mode shows one card at a time (question side first)
- [ ] User can reveal the answer with a single action
- [ ] User can rate their confidence: easy, medium, hard
- [ ] Cards rated as hard appear more frequently in future sessions
- [ ] Cards rated as easy appear less frequently (spaced repetition)
- [ ] Study session tracks number of cards reviewed
- [ ] Cards are shuffled to avoid order memorization
- [ ] Unit tests verify spaced repetition scheduling logic
- [ ] Integration tests confirm confidence ratings are persisted
- [ ] Tests verify card ordering follows spaced repetition rules

### User Story 4: View Study Progress
**As a** user  
**I want to** see my study progress for each deck  
**So that** I know which areas need more attention

**Acceptance Criteria:**
- [ ] Progress view shows total cards in deck
- [ ] Cards are categorized by confidence: mastered, learning, new
- [ ] Percentage of mastered cards is displayed
- [ ] Last study session date is shown
- [ ] Total study sessions count is tracked
- [ ] Progress data loads within 1 second
- [ ] Unit tests verify progress calculation accuracy
- [ ] Integration tests confirm all card states are included
- [ ] Performance tests ensure progress renders for large decks (1000+ cards)

### User Story 5: Delete Decks and Cards
**As a** user  
**I want to** remove decks or individual cards  
**So that** I can manage my study material

**Acceptance Criteria:**
- [ ] Users must confirm before deleting a deck
- [ ] Deleting a deck removes all associated cards
- [ ] Individual cards can be deleted without affecting the deck
- [ ] Deletion does not affect other decks or cards
- [ ] No orphaned data remains after deletion
- [ ] Unit tests verify deletion logic for both decks and cards
- [ ] Integration tests confirm cascade deletion of cards with deck
- [ ] Tests verify no SQL injection vulnerabilities in delete operation

### User Story 6: Search Flashcards
**As a** user  
**I want to** search for specific flashcards across all decks  
**So that** I can quickly find a card on a particular topic

**Acceptance Criteria:**
- [ ] Users can search by question or answer text
- [ ] Search results are returned within 1 second
- [ ] Search is case-insensitive
- [ ] Search input is sanitized to prevent injection attacks
- [ ] Results show the card's question, deck name, and confidence level
- [ ] Users can navigate directly to a card from search results
- [ ] Unit tests cover search algorithm accuracy
- [ ] Security tests verify no injection vulnerabilities in search
- [ ] Performance tests confirm search completes within SLA for 10,000+ cards
