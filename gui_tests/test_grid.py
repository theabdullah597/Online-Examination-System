import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

GRID_URL = "http://localhost:4444"
APP_URL = "http://host.docker.internal:5173"

@pytest.fixture(params=["chrome", "firefox"])
def grid_driver(request):
    """Fixture to connect to Selenium Grid with parameterized browsers"""
    browser = request.param
    
    if browser == "chrome":
        options = webdriver.ChromeOptions()
    elif browser == "firefox":
        options = webdriver.FirefoxOptions()
        
    options.add_argument("--start-maximized")
    
    # Initialize Remote WebDriver
    driver = webdriver.Remote(
        command_executor=GRID_URL,
        options=options
    )
    
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

def test_tc001_grid_parallel_login(grid_driver):
    """TC001: Run student login test on Chrome and Firefox via Grid"""
    wait = WebDriverWait(grid_driver, 10)
    
    # Use APP_URL so the docker container can access the host's localhost
    grid_driver.get(f"{APP_URL}/login")
    
    # Enter credentials
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))).send_keys("student@exam.com")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))).send_keys("student123")
    
    # Submit
    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))).click()
    
    # Assert redirect to dashboard
    wait.until(EC.url_contains("/dashboard"))
    assert "/dashboard" in grid_driver.current_url

    # Check for Overview text
    overview = wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Overview')]")))
    assert overview.is_displayed()
