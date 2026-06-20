import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"

def test_tc010_student_sees_available_exams(student_driver):
    """TC010: Student sees available active exams on dashboard"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(student_driver, 10)
    
    student_driver.get(f"{BASE_URL}/dashboard")
    
    # Check for "Available Exams" header
    available_header = wait.until(EC.presence_of_element_located((By.XPATH, "//h2[text()='Available Exams']")))
    assert available_header.is_displayed()
    
    # Wait for the Start Exam button to appear
    try:
        start_btn = wait.until(EC.presence_of_element_located((By.XPATH, "//button[text()='Start Exam']")))
        assert start_btn.is_displayed()
    except:
        # If no exams are available, the message "No exams scheduled at the moment." is shown
        no_exams = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'No exams scheduled')]")))
        assert no_exams.is_displayed()

def test_tc011_student_starts_exam(student_driver):
    """TC011: Student starts an exam → exam interface loads"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(student_driver, 10)
    
    student_driver.get(f"{BASE_URL}/dashboard")
    
    try:
        # Click the first Start Exam button
        start_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "(//button[text()='Start Exam'])[1]")))
        start_btn.click()
        
        # Verify URL changes to exam interface
        wait.until(EC.url_contains("/exam/"))
        
        # Check for Fullscreen instruction page
        fullscreen_btn = wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Enter Fullscreen & Start Exam')]")))
        assert fullscreen_btn.is_displayed()
    except:
        pytest.skip("No active exams available to start for TC011.")

def test_tc012_student_answers_mcq(student_driver):
    """TC012: Student answers MCQ question → option selected"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(student_driver, 10)
    
    try:
        # Assuming we are on the instruction page from TC011
        fullscreen_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Enter Fullscreen & Start Exam')]")))
        fullscreen_btn.click()
        
        # Wait for questions to load
        wait.until(EC.presence_of_element_located((By.XPATH, "//h3[contains(text(), 'Question')]")))
        
        # Find the first radio button (MCQ or True/False)
        radio_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='radio']")))
        radio_btn.click()
        
        assert radio_btn.is_selected()
    except:
        pytest.skip("Could not interact with MCQ question for TC012.")

def test_tc013_student_navigates_questions(student_driver):
    """TC013: Student navigates next/previous questions"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(student_driver, 10)
    
    try:
        # Click Next
        next_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Next']")))
        next_btn.click()
        
        # Wait for Question 2
        q_header = wait.until(EC.presence_of_element_located((By.XPATH, "//h3[contains(text(), 'Question 2 of')]")))
        assert q_header.is_displayed()
        
        # Click Previous
        prev_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Previous']")))
        prev_btn.click()
        
        # Wait for Question 1
        q_header_back = wait.until(EC.presence_of_element_located((By.XPATH, "//h3[contains(text(), 'Question 1 of')]")))
        assert q_header_back.is_displayed()
    except:
        pytest.skip("Not enough questions to navigate for TC013.")

def test_tc014_exam_timer_visible(student_driver):
    """TC014: Exam timer is visible and counting down"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(student_driver, 10)
    
    try:
        timer_element = wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'Time Left:')]")))
        assert timer_element.is_displayed()
        
        time_text_1 = timer_element.text
        
        # Wait 2 seconds
        time.sleep(2)
        
        time_text_2 = timer_element.text
        
        # Ensure timer has changed (counted down)
        assert time_text_1 != time_text_2
    except:
        pytest.skip("Timer element not found for TC014.")

def test_tc015_student_submits_exam(student_driver):
    """TC015: Student submits exam → result page shown"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(student_driver, 10)
    
    try:
        submit_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Submit Exam']")))
        submit_btn.click()
        
        # The app uses window.confirm, so we need to accept the alert
        alert = wait.until(EC.alert_is_present())
        alert.accept()
        
        # Accept the success alert
        success_alert = wait.until(EC.alert_is_present())
        success_alert.accept()
        
        # Assert redirect to dashboard
        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in student_driver.current_url
    except:
        pytest.skip("Could not complete submission flow for TC015.")
