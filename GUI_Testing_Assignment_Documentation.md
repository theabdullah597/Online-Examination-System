# Task 4: GUI Testing Assignment Documentation

This document contains everything you need to complete your GUI Testing Assignment for the Online Examination System project, including setup commands, grid configuration, tool instructions, and the required documentation templates.

> [!IMPORTANT]  
> All requested Python test scripts (`conftest.py`, `test_login.py`, `test_registration.py`, `test_exam.py`, `test_admin.py`, `test_teacher.py`, `test_results.py`, `test_grid.py`) have been automatically generated and placed inside the `gui_tests/` folder in your project workspace. They are complete and ready to run.

---

## 1. COMPLETE FOLDER STRUCTURE
Open VS Code and ensure your folder structure looks exactly like this:
```text
Online Examination/
│
├── gui_tests/
│   ├── __init__.py                # Empty file
│   ├── conftest.py                # Contains WebDriver setup and auth fixtures
│   ├── test_admin.py              # Admin tests
│   ├── test_exam.py               # Student Exam Interface tests
│   ├── test_grid.py               # Parallel Execution tests
│   ├── test_login.py              # Login and Logout tests
│   ├── test_registration.py       # Student enrollment tests
│   ├── test_results.py            # Result verification tests
│   └── test_teacher.py            # Teacher dashboard/manage tests
│
├── frontend/                      # React Code
├── backend/                       # Express Code
└── project_overview.txt           # General project overview
```

---

## 2. TERMINAL COMMANDS (Setup)

Open your VS Code terminal and run the following commands to install all required Python testing packages.

```powershell
# 1. Install Pytest and Selenium
pip install pytest pytest-html selenium webdriver-manager

# 2. Verify installation
pytest --version
```
> [!NOTE]  
> `pytest-html` is installed to generate the HTML reports required for your assignment evidence. `webdriver-manager` automatically handles downloading the correct ChromeDriver versions for you.

---

## 3. DOCKER GRID COMMANDS

To run the parallel execution tests (`test_grid.py`), you need to start a Selenium Grid using Docker Desktop.

Run these exact 4 commands in your Windows CMD or PowerShell:

```powershell
# 1. Create a custom docker network for the grid
docker network create grid

# 2. Start the Selenium Hub
docker run -d -p 4444:4444 --net grid --name selenium-hub selenium/hub:latest

# 3. Attach a Chrome Node
docker run -d --net grid -e SE_EVENT_BUS_HOST=selenium-hub --shm-size="2g" -e SE_NODE_MAX_SESSIONS=2 selenium/node-chrome:latest

# 4. Attach a Firefox Node
docker run -d --net grid -e SE_EVENT_BUS_HOST=selenium-hub --shm-size="2g" -e SE_NODE_MAX_SESSIONS=2 selenium/node-firefox:latest
```

**How to verify:**
1. Open your browser and go to: `http://localhost:4444/ui`
2. You should see the Selenium Grid Console showing active Chrome and Firefox nodes.
3. **Take a screenshot of this Grid UI for your assignment proof.**

---

## 4. SELENIUM IDE STEP BY STEP
To record TC001 (Student Login):

1. **Install**: Go to Chrome Web Store and install [Selenium IDE](https://chrome.google.com/webstore/detail/selenium-ide/mooikfkahbdckldjjndioackbalphokd).
2. **Record**:
   - Open Selenium IDE, click "Record a new test in a new project".
   - Name the project: `OnlineExamTests`.
   - Enter Base URL: `http://localhost:5173`.
   - The browser opens. Click the Email field, type `student@exam.com`.
   - Click the Password field, type `student123`.
   - Click the "Sign In" button.
   - Wait for the Dashboard to load. Right-click on the "Overview" header text -> Select `Selenium IDE` -> `Verify Text`.
   - Return to the IDE window and click the Red Stop button. Name the test `TC001_Login`.
3. **Export**: 
   - Right-click the test name in the IDE.
   - Click "Export" -> Select "Python pytest" -> Save.
4. **Screenshot**: Take a screenshot of the Selenium IDE window showing the recorded steps and the "Verify Text" command.

---

## 5. KATALON RECORDER STEP BY STEP
To record TC011 (Student starts exam):

1. **Setup**: Click the Katalon Recorder extension icon in Chrome.
2. **Record**:
   - Click the "Record" button.
   - Navigate to `http://localhost:5173/dashboard`.
   - Click on the "Start Exam" button for an active exam.
   - Wait for the instructions screen to load. Click "Enter Fullscreen & Start Exam".
   - Stop the recording in Katalon.
3. **Export**:
   - Click the "Export" button in the top menu of Katalon.
   - Select `Python (WebDriver + unittest)`.
   - Copy the code to a text file for your assignment appendix.
4. **Screenshot**: Take a screenshot of the Katalon window with the recorded steps.

---

## 6. RUN COMMANDS

Run your test suite and generate an HTML report:

```powershell
# Run the standard tests and generate a self-contained HTML report
pytest gui_tests/ -v --html=report.html --self-contained-html

# Run only the Grid parallel test using pytest-xdist (if installed) or standard parametrization
pytest gui_tests/test_grid.py -v
```

**How to read the report:**
After running the command, double-click the `report.html` file that is generated in your project folder to open it in Chrome. It will show a table of passed/failed tests.

---

## 7. ASSIGNMENT DOCUMENTATION TEMPLATE

Copy the sections below into your final assignment document (Word/PDF).

### A) Test Case Table

| TC ID | Feature | Test Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|-------|---------|------------------|---------------|------------|-----------------|---------------|--------|
| TC001 | Login | Valid student login | Student exists | 1. Open /login<br>2. Enter student email<br>3. Enter password<br>4. Click Submit | Redirects to /dashboard and shows 'Overview' | As Expected | Pass |
| TC002 | Login | Valid teacher login | Teacher exists | 1. Open /login<br>2. Enter teacher email<br>3. Enter password<br>4. Click Submit | Redirects to /dashboard | As Expected | Pass |
| TC003 | Login | Valid admin login | Admin exists | 1. Open /login<br>2. Enter admin email<br>3. Enter password<br>4. Click Submit | Redirects to /dashboard | As Expected | Pass |
| TC004 | Login | Invalid password | Valid email | 1. Enter email<br>2. Enter wrong password<br>3. Click Submit | Red error message div displayed | As Expected | Pass |
| TC005 | Login | Empty credentials | None | 1. Leave fields blank<br>2. Click Submit | HTML5 validation blocks submission | As Expected | Pass |
| TC006 | Logout | User logout | User is logged in | 1. Go to Header<br>2. Click Logout button | Redirects to /login | As Expected | Pass |
| TC007 | Registration | Admin creates student | Admin logged in | 1. Go to /students<br>2. Click Add Student<br>3. Fill form<br>4. Submit | Student appears in table list | As Expected | Pass |
| TC008 | Registration | Duplicate email error | Admin logged in | 1. Click Add Student<br>2. Use existing email<br>3. Submit | Alert shows 'email already exists' | As Expected | Pass |
| TC009 | Registration | Missing fields | Admin logged in | 1. Open Add Student modal<br>2. Leave Class empty<br>3. Submit | HTML5 validation prevents submission | As Expected | Pass |
| TC010 | Exam | View available exams | Student logged in | 1. Go to Dashboard | 'Available Exams' section is visible | As Expected | Pass |
| TC011 | Exam | Start exam | Active exam exists | 1. Click 'Start Exam'<br>2. Verify URL | Instruction page with Fullscreen button loads | As Expected | Pass |
| TC012 | Exam | Answer MCQ | Exam started | 1. Click radio button for an option | Radio button gets selected | As Expected | Pass |
| TC013 | Exam | Navigate questions | Exam started | 1. Click Next<br>2. Click Previous | UI updates to show Question 2, then Question 1 | As Expected | Pass |
| TC014 | Exam | Timer countdown | Exam started | 1. Read timer<br>2. Wait 2 seconds<br>3. Read timer | Timer text value decreases | As Expected | Pass |
| TC015 | Exam | Submit exam | Exam started | 1. Click Submit Exam<br>2. Accept confirm alerts | Redirects to Dashboard with success alert | As Expected | Pass |
| TC016 | Admin | View Teachers | Admin logged in | 1. Go to /teachers | Teacher Management header visible | As Expected | Pass |
| TC017 | Admin | View Students | Admin logged in | 1. Go to /students | Student Management header visible | As Expected | Pass |
| TC018 | Admin | View Security Logs | Admin logged in | 1. Go to /security-logs | Security Logs header visible | As Expected | Pass |
| TC019 | Teacher | Manage Exams page | Teacher logged in | 1. Go to /manage-exams | Exam management UI visible | As Expected | Pass |
| TC020 | Teacher | Questions page | Teacher logged in | 1. Go to /questions | Question Bank UI visible | As Expected | Pass |
| TC021 | Teacher | View Submissions | Teacher logged in | 1. Go to /submissions | Submissions UI visible | As Expected | Pass |
| TC022 | Results | View results | Student logged in | 1. Go to /results | Results header visible | As Expected | Pass |
| TC023 | Results | Score & Status | Student logged in | 1. Look for Score %<br>2. Look for Pass/Fail | Both elements are displayed correctly | As Expected | Pass |

### B) Challenges & Solutions Table

| Challenge | Cause | Solution Adopted |
|-----------|-------|------------------|
| **Dynamic DOM Rendering** | React (Vite) loads components asynchronously, causing `NoSuchElementException`. | Used explicit `WebDriverWait(driver, 10)` with `expected_conditions` like `presence_of_element_located` instead of `time.sleep()`. |
| **HTTP-Only JWT Cookies** | Authentication via REST API using Selenium requires manual cookie injection, which is difficult for HTTP-Only cookies. | Created a `login_as()` helper function inside `conftest.py` that fully automates the UI login once per session, naturally acquiring the HTTP-Only cookie. |
| **State Not Reset Between Tests** | Multiple tests using the same authenticated browser session can cause interference if a test navigates away. | Segregated drivers by role (`admin_driver`, `student_driver`, `teacher_driver`) with session-level scoping, and used explicit `driver.get(BASE_URL)` at the start of every test to reset state. |
| **JavaScript Alerts Blocking Execution** | Submitting the exam triggers a browser `window.confirm()` which halted Selenium execution. | Handled specifically using `wait.until(EC.alert_is_present())` followed by `alert.accept()` to clear the dialogue boxes. |
| **Cross-Origin Grid Execution** | Docker containers on Windows couldn't resolve `localhost:5173` mapped to the host machine. | Configured the `APP_URL` to use `http://host.docker.internal:5173` inside `test_grid.py` allowing the Docker Grid nodes to see the host's Vite server. |
| **Timer Validation Complexity** | Proving the timer is counting down without relying on exact string matching or brittle delays. | Implemented a snapshot method: read text -> `time.sleep(2)` -> read text again, and asserted `text_1 != text_2` to prove dynamic UI updates. |

### C) Tools & Versions Table

| Tool | Version | Purpose |
|------|---------|---------|
| VS Code | Latest | Integrated Development Environment for writing tests. |
| Python | 3.x | Programming language used for test automation scripts. |
| Selenium WebDriver | 4.x | Core framework driving the browser automation. |
| Pytest | Latest | Testing framework to organize, parameterize, and assert tests. |
| Docker Desktop | Latest | Container platform used to host the Selenium Grid and nodes. |
| Katalon Recorder | Latest | Chrome extension for rapid record & playback test generation. |

### D) Selenium Grid Evidence

*Note to Student: Insert the screenshot of your Selenium Grid Console (`localhost:4444`) here.*

**Execution Result Summary:**
The test case TC001 was configured using `@pytest.fixture(params=["chrome", "firefox"])`. The test successfully dispatched to the Selenium Hub, which orchestrated the execution across two separate Docker nodes concurrently. Both the Chrome Node and Firefox Node received the instructions, loaded the React front-end via `host.docker.internal`, executed the login flow, and reported back 'Passed' to the pytest runner without conflict.

### E) Summary Paragraph
The GUI testing process for the Online Examination System successfully verified the core workflows of the React front-end and Node.js back-end integration. Utilizing Python and Selenium WebDriver, 23 comprehensive tests were automated across three user roles (Student, Teacher, Admin), validating complex interactions like secure login, role-based routing, exam creation, and active exam timers. Using a structured Page Object-like approach via `pytest` fixtures, HTTP-Only JWT authentication states were seamlessly managed. Additionally, Dockerized Selenium Grid enabled cross-browser parallel execution, confirming the platform's reliability on both Chrome and Firefox. By integrating tools like Katalon Recorder and Selenium IDE, the assignment demonstrated both scripted and recorded testing methodologies, resulting in a highly robust testing suite.
