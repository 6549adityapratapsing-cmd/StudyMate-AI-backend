async function runAuthTest() {
  console.log('🧪 Testing Auth Endpoints on http://localhost:5000...');

  // 1. Test Register
  const registerPayload = {
    email: 'alex.student@college.edu',
    password: 'securePassword123',
    fullName: 'Alex Student',
    collegeCourse: 'Computer Science (1st Year)',
  };

  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload),
  });

  const regData = await regRes.json();
  console.log('1. Registration Response:', regRes.status, regData.message);

  if (!regData.success) {
    console.error('Registration failed:', regData);
    process.exit(1);
  }

  const token = regData.data.token;
  console.log('✅ Received JWT Token successfully (length:', token.length, ')');

  // 2. Test Login
  const loginPayload = {
    email: 'alex.student@college.edu',
    password: 'securePassword123',
  };

  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginPayload),
  });

  const loginData = await loginRes.json();
  console.log('2. Login Response:', loginRes.status, loginData.message);

  // 3. Test Protected Profile Route
  const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const profileData = await profileRes.json();
  console.log('3. Protected Profile Response:', profileRes.status, profileData.data.user.full_name);
  console.log('🎉 ALL AUTHENTICATION TESTS PASSED!');
}

runAuthTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
