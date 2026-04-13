fetch('fake-data.json', {
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'John Doe',
        age: 30
    }),
})
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error('Fetch error:', err));