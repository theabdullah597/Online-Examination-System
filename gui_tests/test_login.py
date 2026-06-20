import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"

def test_tc001_student_login(driver, wait):
    """TC001: Valid student login"""
    driver.get(f"{BASE_URL}/login")
    
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))).send_keys("theabullahx9779@gmail.com")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))).send_keys("123456")
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))).click()
    
    # Assert redirect to dashboard
    wait.until(EC.url_contains("/dashboard"))
    assert "/dashboard" in driver.current_url

    # Check for Overview text (or Pending Exams for student)
    overview = wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Overview')]")))
    assert overview.is_displayed()

def test_tc002_teacher_login(driver, wait):
    """TC002: Valid teacher login"""
    driver.get(f"{BASE_URL}/login")
    
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))).send_keys("teacher@exam.com")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))).send_keys("teacher123")
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))).click()
    
    wait.until(EC.url_contains("/dashboard"))
    assert "/dashboard" in driver.current_url

def test_tc003_admin_login(driver, wait):
    """TC003: Valid admin login"""
    driver.get(f"{BASE_URL}/login")
    
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))).send_keys("admin@example.com")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))).send_keys("Admin@123")
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))).click()
    
    wait.until(EC.url_contains("/dashboard"))
    assert "/dashboard" in driver.current_url

def test_tc004_invalid_password(driver, wait):
    """TC004: Invalid password shows error message"""
    driver.get(f"{BASE_URL}/login")
    
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))).send_keys("khayamazan369@gmail.com")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))).send_keys("wrongpassword")
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))).click()
    
    # Wait for the error div
    # The error div has color: var(--danger) and bg rgba(239, 68, 68, 0.1) based on Login.jsx
    error_msg = wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(@style, 'rgba(239, 68, 68, 0.1)')]")))
    assert error_msg.is_displayed()
    assert len(error_msg.text) > 0

def test_tc005_empty_credentials(driver, wait):
    """TC005: Empty email/password shows HTML5 validation"""
    driver.get(f"{BASE_URL}/login")
    
    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
    
    submit_btn.click()
    
    # HTML5 required validation
    is_valid = driver.execute_script("return arguments[0].checkValidity();", email_input)
    assert is_valid is False

def test_tc006_logout(admin_driver):
    """TC006: Logout redirects to login page"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(admin_driver, 10)
    
    # admin_driver is already logged in and at dashboard
    admin_driver.get(f"{BASE_URL}/dashboard")
    
    # Wait for the Header Logout button
    logout_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Logout')]")))
    logout_btn.click()
    
    wait.until(EC.url_contains("/login"))
    assert "/login" in admin_driver.current_url
