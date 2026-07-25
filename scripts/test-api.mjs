const r = await fetch('http://localhost:3000/api/cookies?carousel=true')
console.log('STATUS:', r.status)
const data = await r.json()
console.log('COOKIES RETURNED:', Array.isArray(data) ? data.length : data)
