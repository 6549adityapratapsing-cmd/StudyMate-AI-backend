async function runUploadTest() {
  console.log('🧪 Testing Material Upload Pipeline on http://localhost:5000...');

  // 1. Authenticate test student (register or login)
  let token = null;
  const email = `test.student.${Date.now()}@college.edu`;

  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'securePassword123',
      fullName: 'Alex Test Student',
      collegeCourse: 'B.Tech Physics',
    }),
  });

  const regData = await regRes.json();
  if (regData.success) {
    token = regData.data.token;
    console.log('✅ Registered test student:', email);
  } else {
    console.error('Registration failed:', regData);
    process.exit(1);
  }

  // 2. Test Material Upload (Text Notes)
  const uploadPayload = {
    title: 'Physics - Laws of Motion Chapter 1',
    text: `Newton's First Law of Motion: An object at rest remains at rest, and an object in motion remains in motion at constant speed and in a straight line unless acted on by an unbalanced force.

    Newton's Second Law of Motion: The rate of change of momentum of a body is directly proportional to the applied force and takes place in the direction in which the force acts. Formula: F = ma.

    Newton's Third Law of Motion: To every action there is always an equal and opposite reaction.`,
    isQuestionPaper: false,
    academicYear: '2026',
  };

  const uploadRes = await fetch('http://localhost:5000/api/materials/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(uploadPayload),
  });

  const uploadData = await uploadRes.json();
  console.log('2. Upload Status:', uploadRes.status, uploadData.message);

  if (!uploadData.success) {
    console.error('Upload failed:', uploadData);
    process.exit(1);
  }

  console.log('   Saved Material ID:', uploadData.data.material.id);
  console.log('   Word count:', uploadData.data.stats.wordCount);
  console.log('   Reading time:', uploadData.data.stats.estimatedReadingMinutes, 'min');

  // 3. Test GET /api/materials
  const listRes = await fetch('http://localhost:5000/api/materials', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const listData = await listRes.json();
  console.log('3. List Materials count:', listData.data.materials.length);
  console.log('🎉 MATERIAL INGESTION PIPELINE VERIFIED SUCCESSFULLY!');
}

runUploadTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
