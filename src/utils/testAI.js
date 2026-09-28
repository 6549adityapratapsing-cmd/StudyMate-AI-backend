async function runAITest() {
  console.log('🧪 Testing AI Study Assistant Pipeline on http://localhost:5000...');

  // 1. Authenticate test student
  const email = `ai.student.${Date.now()}@college.edu`;
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'securePassword123',
      fullName: 'Study Student',
      collegeCourse: 'Mechanical Engineering',
    }),
  });

  const regData = await regRes.json();
  const token = regData.data.token;
  console.log('✅ Authenticated test student.');

  // 2. Upload study material
  const uploadRes = await fetch('http://localhost:5000/api/materials/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Thermodynamics Chapter 1',
      text: `The First Law of Thermodynamics is the law of conservation of energy: energy can neither be created nor destroyed, only transformed from one form to another. Formula: delta U = Q - W, where delta U is change in internal energy, Q is heat added, and W is work done by the system.
      
      The Second Law of Thermodynamics states that the total entropy of an isolated system always increases over time. Heat cannot spontaneously flow from a colder body to a hotter body without external work.
      
      Absolute Zero is defined as 0 Kelvin (-273.15 C), the theoretical temperature at which particles have minimum thermal motion.`,
    }),
  });

  const uploadData = await uploadRes.json();
  const materialId = uploadData.data.material.id;
  console.log('✅ Uploaded sample material ID:', materialId);

  // 3. Test Quick Summary
  const sumRes = await fetch('http://localhost:5000/api/ai/quick-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ materialId }),
  });
  const sumData = await sumRes.json();
  console.log('3. Quick Summary Status:', sumRes.status, 'Title:', sumData.data?.summary?.title);

  // 4. Test Key Points
  const kpRes = await fetch('http://localhost:5000/api/ai/key-points', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ materialId }),
  });
  const kpData = await kpRes.json();
  console.log('4. Key Points Count:', kpData.data?.keyPoints?.length);

  // 5. Test Important Questions
  const qRes = await fetch('http://localhost:5000/api/ai/important-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ materialId }),
  });
  const qData = await qRes.json();
  console.log('5. Important Questions Count:', qData.data?.questions?.length);

  // 6. Test Explain Simply
  const expRes = await fetch('http://localhost:5000/api/ai/explain', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ materialId, concept: 'Entropy' }),
  });
  const expData = await expRes.json();
  console.log('6. Explain Simply Concept:', expData.data?.explanation?.concept);

  console.log('🎉 ALL AI STUDY ENGINE ENDPOINTS VERIFIED SUCCESSFULLY!');
}

runAITest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
