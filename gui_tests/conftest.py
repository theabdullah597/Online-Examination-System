import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

BASE_URL = "http://localhost:5173"

@pytest.fixture(scope="function")
def driver():
    """Returns an unauthenticated Chrome driver"""
    options = ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    options.add_argument("--remote-allow-origins=*")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()

@pytest.fixture
def wait(driver):
    """Returns a WebDriverWait instance (10 seconds)"""
    return WebDriverWait(driver, 10)

def login_as(driver, wait, email, password):
    """Helper method to log in via UI so the browser gets the HTTP-only JWT cookie"""
    driver.get(f"{BASE_URL}/login")
    
    # Wait for email field and enter credentials
    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    email_input.clear()
    email_input.send_keys(email)
    
    password_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
    password_input.clear()
    password_input.send_keys(password)
    
    # Click submit
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
    submit_btn.click()
    
    # Wait for dashboard to load (checking URL)
    wait.until(EC.url_contains("/dashboard"))
    
    return driver

@pytest.fixture(scope="session")
def admin_driver():
    """Authenticated driver for Admin"""
    options = ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    options.add_argument("--remote-allow-origins=*")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
    wait = WebDriverWait(driver, 10)
    login_as(driver, wait, "admin@example.com", "Admin@123")
    yield driver
    driver.quit()

@pytest.fixture(scope="session")
def teacher_driver():
    """Authenticated driver for Teacher"""
    options = ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    options.add_argument("--remote-allow-origins=*")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
    wait = WebDriverWait(driver, 10)
    login_as(driver, wait, "khayamazan369@gmail.com", "123456")
    yield driver
    driver.quit()

@pytest.fixture(scope="session")
def student_driver():
    """Authenticated driver for Student"""
    options = ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    options.add_argument("--remote-allow-origins=*")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
    wait = WebDriverWait(driver, 10)
    login_as(driver, wait, "theabullahx9779@gmail.com", "123456")
    yield driver
    driver.quit()
