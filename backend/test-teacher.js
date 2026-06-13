async function test() {
  try {
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@test.com',
        password: 'Password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in as Teacher, token:', !!token);

    const classRes = await fetch('http://127.0.0.1:5000/api/teacher/classes', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Classes Status:', classRes.status);
    console.log('Classes Data:', await classRes.json());
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
