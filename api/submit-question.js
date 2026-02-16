export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, question } = req.body || {}

  if (!name || !email || !question) {
    return res.status(400).json({ error: 'Missing required fields: name, email, question' })
  }

  if (name.length > 200 || email.length > 254 || question.length > 5000) {
    return res.status(400).json({ error: 'Input exceeds maximum length' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  const NODEBB_URL = process.env.VITE_NODEBB_URL || 'https://financeforge.nodebb.com'
  const API_TOKEN = process.env.NODEBB_API_TOKEN
  const CATEGORY_ID = process.env.NODEBB_QUESTIONS_CATEGORY_ID || '7'

  if (!API_TOKEN) {
    console.error('NODEBB_API_TOKEN is not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const response = await fetch(`${NODEBB_URL}/api/v3/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        cid: parseInt(CATEGORY_ID, 10),
        title: `Question from ${name}: ${question.slice(0, 100)}`,
        content: `**From:** ${name}\n**Email:** ${email}\n\n---\n\n${question}`,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('NodeBB API error:', response.status, errorBody)
      return res.status(502).json({ error: 'Failed to submit question to forum' })
    }

    const data = await response.json()
    return res.status(200).json({
      success: true,
      topicId: data.response?.tid,
    })
  } catch (err) {
    console.error('Error posting to NodeBB:', err)
    return res.status(502).json({ error: 'Failed to connect to forum' })
  }
}
