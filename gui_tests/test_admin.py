import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"

def test_tc016_admin_view_teachers(admin_driver):
    """TC016: Admin can view Teachers page"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(admin_driver, 10)
    
    admin_driver.get(f"{BASE_URL}/teachers")
    
    # Wait for page title/header
    header = wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Teacher Management')] | //h1[contains(text(), 'Teachers')] | //h3[contains(text(), 'Registered Teachers')]")))
    assert header.is_displayed()

def test_tc017_admin_view_students(admin_driver):
    """TC017: Admin can view Students page"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(admin_driver, 10)
    
    admin_driver.get(f"{BASE_URL}/students")
    
    header = wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Student Management')] | //h1[contains(text(), 'Students')]")))
    assert header.is_displayed()

def test_tc018_admin_view_security_logs(admin_driver):
    """TC018: Admin can view Security Logs page"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(admin_driver, 10)
    
    admin_driver.get(f"{BASE_URL}/security-logs")
    
    header = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'security logs')]")))
    assert header.is_displayed()
