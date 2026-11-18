async function testEmail() {
  const response = await fetch('http://localhost:5000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: 'test@gmail.com',
      subject: 'Congratulations',
      message: 'You won a free prize'
    })
  });

  const data = await response.json();
  console.log(data);
}

testEmail();
