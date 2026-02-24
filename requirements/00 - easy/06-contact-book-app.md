# Contact Book Application

## System Description
A personal contact management application that allows users to store, organize, and search contact information. Each contact includes name, phone number, email, address, and custom notes. The application provides a simple interface for managing personal and professional contacts.

## System Constraints & Considerations
- **Data Persistence**: Contact data must persist across application restarts
- **Input Validation**: All user inputs must be validated (email format, phone format)
- **Data Privacy**: Contact information must be stored securely
- **Single User**: Application operates in single-user mode (no authentication required)
- **Import/Export**: Support importing and exporting contacts in standard formats

---

## User Stories

### User Story 1: Add New Contacts
**As a** user  
**I want to** add a new contact with personal and professional details  
**So that** I can store contact information in one place

**Acceptance Criteria:**
- [ ] Users can input first name (required, max 50 characters) and last name (required, max 50 characters)
- [ ] Users can input phone number (validated format)
- [ ] Users can input email address (validated format)
- [ ] Users can input mailing address (optional, max 300 characters)
- [ ] Users can add optional notes (max 500 characters)
- [ ] System validates all inputs to prevent injection attacks
- [ ] Each contact is assigned a unique identifier
- [ ] Timestamps are recorded for creation time
- [ ] Duplicate phone number or email triggers a warning
- [ ] Unit tests cover all validation scenarios
- [ ] Integration tests verify data is persisted correctly
- [ ] Test coverage must be at least 80%

### User Story 2: View All Contacts
**As a** user  
**I want to** see a list of all my contacts  
**So that** I can browse my contact list

**Acceptance Criteria:**
- [ ] All contacts are displayed in a readable list format
- [ ] Contacts show name, phone number, and email at a glance
- [ ] List is sorted alphabetically by last name (default)
- [ ] Users can toggle sorting by first name or date added
- [ ] Pagination is implemented if there are more than 50 contacts
- [ ] UI properly escapes all data to prevent XSS attacks
- [ ] Unit tests verify sorting and pagination logic
- [ ] End-to-end tests verify UI renders correctly
- [ ] Performance tests show list renders within 2 seconds for 5000 contacts

### User Story 3: Edit Contact Details
**As a** user  
**I want to** update information for an existing contact  
**So that** my contact list stays current and accurate

**Acceptance Criteria:**
- [ ] Users can modify any field of an existing contact
- [ ] All inputs are re-validated during edit (max lengths, format checks)
- [ ] Original values are preserved if update fails
- [ ] Modification timestamp is updated
- [ ] Input sanitization prevents XSS and code injection
- [ ] Users see confirmation of successful edit
- [ ] Unit tests cover all validation and update scenarios
- [ ] Integration tests confirm data persistence after edit
- [ ] Concurrency tests verify no race conditions exist

### User Story 4: Delete Contacts
**As a** user  
**I want to** remove a contact from my list  
**So that** I can keep my contact book clean and relevant

**Acceptance Criteria:**
- [ ] Users must confirm deletion before contact is removed
- [ ] Deleted contacts are removed from the system
- [ ] Deletion does not affect other contacts
- [ ] No orphaned data remains after deletion
- [ ] Unit tests verify deletion logic
- [ ] Integration tests confirm data is fully removed
- [ ] Tests verify no SQL injection vulnerabilities in delete operation

### User Story 5: Search and Filter Contacts
**As a** user  
**I want to** search for contacts by name, phone, or email  
**So that** I can quickly find a specific person

**Acceptance Criteria:**
- [ ] Users can search by first name, last name, phone number, or email
- [ ] Search results are returned within 1 second
- [ ] Search is case-insensitive
- [ ] Search input is sanitized to prevent injection attacks
- [ ] Partial matches are supported (e.g., searching "Jo" finds "John")
- [ ] Results display with match highlights
- [ ] Unit tests cover search algorithm and filtering logic
- [ ] Security tests verify no injection vulnerabilities in search
- [ ] Performance tests confirm search completes within SLA for 10,000+ contacts

### User Story 6: Import and Export Contacts
**As a** user  
**I want to** import contacts from a CSV file and export my contacts  
**So that** I can transfer contacts between applications

**Acceptance Criteria:**
- [ ] Users can import contacts from a CSV file
- [ ] CSV import validates all fields before saving
- [ ] Failed imports show error messages per row without stopping the batch
- [ ] Users can export all contacts to CSV format
- [ ] CSV includes columns: first name, last name, phone, email, address, notes
- [ ] Exported file is named with current date (contacts_2025-01-15.csv)
- [ ] Large imports (5,000+ contacts) complete within 15 seconds
- [ ] Unit tests verify CSV parsing and format correctness
- [ ] Integration tests confirm all data is imported/exported accurately
- [ ] Security tests verify no injection vulnerabilities in import
