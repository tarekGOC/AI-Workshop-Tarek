# Markdown Notes Application

## System Description
A lightweight note-taking application that supports Markdown formatting. Users can create, edit, and organize notes with live Markdown preview. Notes are stored locally and can be categorized with tags for easy retrieval.

## System Constraints & Considerations
- **Data Persistence**: Notes must persist across application restarts
- **Markdown Rendering**: Must support standard Markdown syntax (headers, lists, bold, italic, links, code blocks)
- **Input Validation**: All user inputs must be validated and sanitized
- **Offline Operation**: Application must work without internet connectivity
- **Single User**: Application operates in single-user mode (no authentication required)

---

## User Stories

### User Story 1: Create and Edit Notes
**As a** user  
**I want to** create a new note with a title and Markdown-formatted content  
**So that** I can capture and format my thoughts

**Acceptance Criteria:**
- [ ] Users can input a title (required, max 100 characters)
- [ ] Users can write note content using Markdown syntax
- [ ] Live preview shows rendered Markdown alongside the editor
- [ ] System validates input to prevent code injection attacks
- [ ] New notes are assigned a unique identifier
- [ ] Timestamps are recorded for creation and last modification
- [ ] Auto-save triggers after 5 seconds of inactivity
- [ ] Unit tests cover all validation scenarios
- [ ] Integration tests verify data is persisted correctly
- [ ] Test coverage must be at least 80%

### User Story 2: View All Notes
**As a** user  
**I want to** see a list of all my notes  
**So that** I can browse and select a note to read or edit

**Acceptance Criteria:**
- [ ] All notes are displayed in a list with title and last modified date
- [ ] Notes show a preview snippet of the first 100 characters of content
- [ ] List is sorted by last modified date (newest first)
- [ ] Pagination is implemented if there are more than 50 notes
- [ ] No sensitive data is exposed in the display
- [ ] UI properly escapes all data to prevent XSS attacks
- [ ] Unit tests verify sorting and pagination logic
- [ ] End-to-end tests verify UI renders correctly
- [ ] Performance tests show list renders within 2 seconds for 1000 notes

### User Story 3: Markdown Rendering and Preview
**As a** user  
**I want to** see my Markdown content rendered as formatted HTML  
**So that** I can verify the appearance of my notes

**Acceptance Criteria:**
- [ ] Headings (H1-H6) render correctly
- [ ] Bold, italic, and strikethrough text render correctly
- [ ] Ordered and unordered lists render correctly
- [ ] Code blocks with syntax highlighting are supported
- [ ] Links and images render correctly
- [ ] Tables render correctly
- [ ] Blockquotes render correctly
- [ ] Rendered HTML is sanitized to prevent XSS attacks
- [ ] Preview updates in real-time as user types (<200ms delay)
- [ ] Unit tests verify rendering accuracy for all Markdown elements
- [ ] Security tests confirm HTML sanitization prevents script injection

### User Story 4: Tag and Organize Notes
**As a** user  
**I want to** add tags to my notes  
**So that** I can categorize and organize them

**Acceptance Criteria:**
- [ ] Users can add one or more tags to a note
- [ ] Tags are alphanumeric and max 30 characters each
- [ ] Users can view all existing tags in a sidebar
- [ ] Users can filter notes by selecting one or more tags
- [ ] Tags can be renamed or deleted
- [ ] Deleting a tag removes it from all associated notes
- [ ] Tag names are validated and sanitized
- [ ] Unit tests verify tag management logic
- [ ] Integration tests confirm tag-note relationships
- [ ] Tests verify no injection in tag operations

### User Story 5: Search Notes
**As a** user  
**I want to** search notes by title and content  
**So that** I can quickly find specific information

**Acceptance Criteria:**
- [ ] Users can search by title and note content text
- [ ] Search results are returned within 1 second
- [ ] Search is case-insensitive
- [ ] Search input is sanitized to prevent injection attacks
- [ ] Results display with match highlights
- [ ] Users can combine search with tag filters
- [ ] Unit tests cover search algorithm and filtering logic
- [ ] Security tests verify no injection vulnerabilities in search
- [ ] Performance tests confirm search completes within SLA for 5000+ notes

### User Story 6: Delete Notes
**As a** user  
**I want to** delete notes I no longer need  
**So that** I can keep my notes organized and uncluttered

**Acceptance Criteria:**
- [ ] Users must confirm deletion before note is removed
- [ ] Deleted notes are removed from the system
- [ ] Associated tags are updated (tag removed from note)
- [ ] Deletion does not affect other notes
- [ ] No orphaned data remains after deletion
- [ ] Unit tests verify deletion logic
- [ ] Integration tests confirm data is fully removed
- [ ] Tests verify no SQL injection vulnerabilities in delete operation
