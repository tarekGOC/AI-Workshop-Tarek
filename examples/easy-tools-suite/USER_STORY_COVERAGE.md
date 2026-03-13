# Easy Challenges Coverage Map

This document maps each challenge under `requirements/00 - easy` to where it is implemented in the app.

## 1) Todo List App
- Backend APIs: `GET/POST /api/todos`, `PUT/DELETE /api/todos/<id>`
- Frontend UI: `renderTodos`, `todoAddModal`
- Template action: `POST /api/templates/todos` + `Use Template` button in Todo toolbar
- User stories covered: create, list, toggle complete, edit, delete, search/filter, pagination, audit entries

## 2) Temperature Converter
- Backend APIs: `POST /api/temperature/convert`, `GET/DELETE /api/temperature/history`
- Frontend UI: `renderTemperature`
- Template action: `POST /api/templates/temperature` + `Use Template` button in Temperature card
- User stories covered: C/F/K conversion, batch conversion, validation, recent history

## 3) Password Strength Checker
- Backend API: `POST /api/password/check`
- Frontend UI: `renderPassword`
- Template action: `POST /api/templates/password` + `Use Template` button (fills sample password)
- User stories covered: real-time scoring, criteria checks, weak pattern warnings, recommendations

## 4) Expense Tracker
- Backend APIs: `GET/POST /api/expenses`, `PUT/DELETE /api/expenses/<id>`, `GET /api/expenses/summary`, `GET /api/expenses/export`, category APIs
- Frontend UI: `renderExpenses`, `loadExpenses`, `expenseModal`, `renderExpenseSummary`
- Template action: `POST /api/templates/expenses` + `Use Template` button in Expenses toolbar
- User stories covered: create/list/delete, categories, date filtering, monthly summary, CSV export

## 5) Quote of the Day
- Backend APIs: `GET /api/quotes/today`, `GET /api/quotes/date/<date>`, `POST /api/quotes/favorite`, `GET /api/quotes/favorites`, `GET /api/quotes/search`
- Frontend UI: `renderQuotes`, `renderQuoteFavorites`, `renderQuoteSearch`
- Template action: `POST /api/templates/quotes` + `Use Template` button in Today tab
- User stories covered: daily quote, date history navigation, favorite collection, search

## 6) Contact Book
- Backend APIs: `GET/POST /api/contacts`, `PUT/DELETE /api/contacts/<id>`, `POST /api/contacts/import`, `GET /api/contacts/export`
- Frontend UI: `renderContacts`, `contactModal`
- Template action: `POST /api/templates/contacts` + `Use Template` button in Contacts toolbar
- User stories covered: create/list/edit/delete, search/sort, import/export CSV, duplicate warning

## 7) Markdown Notes
- Backend APIs: `GET/POST /api/notes`, `GET/PUT/DELETE /api/notes/<id>`, `GET /api/notes/tags`, `POST /api/notes/render`
- Frontend UI: `renderNotes`, `renderNoteEditor`
- Template action: `POST /api/templates/notes` + `Use Template` button in Notes toolbar
- User stories covered: create/edit/list, markdown preview, tagging, search/filter

## 8) Habit Tracker
- Backend APIs: `GET/POST /api/habits`, `PUT/DELETE /api/habits/<id>`, `POST /api/habits/<id>/toggle`, `GET /api/habits/<id>/calendar`, `GET /api/habits/stats`
- Frontend UI: `renderHabits`, `loadHabits`, `showHabitCalendar`, `renderHabitStats`, `habitModal`
- Template action: `POST /api/templates/habits` + `Use Template` button in Habits view
- User stories covered: create/edit/delete habits, daily completion, streaks, calendar history, summary stats

## 9) Unit Converter
- Backend APIs: `GET /api/units/categories`, `POST /api/units/convert`, `GET/DELETE /api/units/history`
- Frontend UI: `renderUnits`, `loadUnitHistory`
- Template action: `POST /api/templates/units` + `Use Template` button in Unit Converter card
- User stories covered: multiple categories, batch conversion, validation, history

## 10) Flashcard Study App
- Backend APIs: deck APIs (`/api/decks*`), card APIs (`/api/cards*`), study/rating APIs
- Frontend UI: `renderFlashcards`, `renderDeckCards`, `renderStudyMode`, `deckModal`, `cardModal`
- Template action: `POST /api/templates/flashcards` + `Use Template` button in Decks header
- User stories covered: create deck, create/edit/delete cards, study flow, confidence rating, progress badges

## Notes on story depth
- The app implements the core functional user stories across all 10 challenges.
- Some advanced non-functional criteria in the requirement docs (for example formal load-test SLAs and full automated coverage targets) are partially addressed by architecture choices but are not fully automated in this prototype.
