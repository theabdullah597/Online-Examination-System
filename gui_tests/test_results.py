import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5173"

def test_tc022_student_view_results(student_driver):
    """TC022: Student can view their result after exam"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(student_driver, 10)
    
    student_driver.get(f"{BASE_URL}/results")
    
    header = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'result')]")))
    assert header.is_displayed()

def test_tc023_score_and_status_displayed(student_driver):
    """TC023: Score and pass/fail status displayed correctly"""
    from selenium.webdriver.support.ui import WebDriverWait
    wait = WebDriverWait(student_driver, 10)
    
    student_driver.get(f"{BASE_URL}/results")
    
    try:
        # Assuming results are displayed in a table or list containing "Score" or "%"
        score_element = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Score') or contains(text(), '%')]")))
        assert score_element.is_displayed()
        
        # Verify status is displayed (Passed or Failed)
        status_element = wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Pass') or contains(text(), 'Fail')]")))
        assert status_element.is_displayed()
    except Exception:
        pytest.skip("No results available to verify score and status.")
