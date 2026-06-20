import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"

def test_tc019_teacher_manage_exams(teacher_driver):
    """TC019: Teacher can access ManageExams page"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(teacher_driver, 10)
    
    teacher_driver.get(f"{BASE_URL}/manage-exams")
    
    header = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'exam')]")))
    assert header.is_displayed()

def test_tc020_teacher_questions_page(teacher_driver):
    """TC020: Teacher can access Questions page"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(teacher_driver, 10)
    
    teacher_driver.get(f"{BASE_URL}/questions")
    
    header = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'question')]")))
    assert header.is_displayed()

def test_tc021_teacher_submissions_page(teacher_driver):
    """TC021: Teacher can view Submissions page"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(teacher_driver, 10)
    
    teacher_driver.get(f"{BASE_URL}/submissions")
    
    header = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'submission')]")))
    assert header.is_displayed()
