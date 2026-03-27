function parseDate(dateString) {
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

function safeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function formatISODate(date) {
  return date.toISOString().slice(0, 10)
}

function getDateRange(startDate, endDate) {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (!start || !end || end < start) return []

  const dates = []
  const cursor = new Date(start)
  while (cursor <= end) {
    dates.push(formatISODate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

function pickInterest(interests, dayIndex) {
  if (!interests?.length) return 'local highlights'
  return interests[dayIndex % interests.length].toLowerCase()
}

function activityFor(slot, destination, interest, pace, notes) {
  const base = `${destination} ${interest}`
  const paceSuffix =
    pace === 'Fast-paced'
      ? 'with an efficient route'
      : pace === 'Relaxed'
        ? 'with extra downtime'
        : 'with a balanced schedule'

  if (slot === 'morning') {
    return {
      slot,
      title: `Morning ${interest} exploration`,
      description: `Start with ${base}, ${paceSuffix}.`,
    }
  }
  if (slot === 'afternoon') {
    return {
      slot,
      title: `Afternoon local experiences`,
      description: `Visit popular spots and food areas in ${destination}.`,
    }
  }
  return {
    slot,
    title: `Evening unwind`,
    description: notes
      ? `Wrap up with easy plans matching your note: ${notes}.`
      : `Enjoy a relaxed evening and local dinner in ${destination}.`,
  }
}

function normalizeItineraryDays(days, startDate, endDate) {
  const dateRange = getDateRange(startDate, endDate)
  const safeDates = dateRange.length ? dateRange : [startDate || formatISODate(new Date())]
  const inputDays = Array.isArray(days) && days.length ? days : []

  return safeDates.map((date, index) => {
    const source = inputDays[index] || {}
    const activities = Array.isArray(source.activities) ? source.activities : []
    const normalizedActivities = ['morning', 'afternoon', 'evening'].map((slot) => {
      const match = activities.find((item) => item?.slot === slot) || {}
      return {
        slot,
        title: safeText(match.title, `${slot[0].toUpperCase()}${slot.slice(1)} activity`),
        description: safeText(match.description, 'Activity details to be finalized.'),
      }
    })

    return {
      dayNumber: Number(source.dayNumber) || index + 1,
      date: safeText(source.date, date),
      title: safeText(source.title, `Day ${index + 1} plan`),
      summary: safeText(source.summary, 'Day overview based on your preferences.'),
      activities: normalizedActivities,
    }
  })
}

function extractJsonFromText(text) {
  const trimmed = text.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return ''
  return trimmed.slice(firstBrace, lastBrace + 1)
}

export async function generateTripItineraryMock({
  destination,
  startDate,
  endDate,
  budget,
  interests,
  pace,
  notes,
}) {
  const dates = getDateRange(startDate, endDate)
  const safeDates = dates.length ? dates : [startDate || formatISODate(new Date())]

  const days = safeDates.map((date, index) => {
    const dayNumber = index + 1
    const interest = pickInterest(interests, index)
    const activities = ['morning', 'afternoon', 'evening'].map((slot) =>
      activityFor(slot, destination || 'the destination', interest, pace, notes),
    )

    return {
      dayNumber,
      date,
      title: `Day ${dayNumber}: ${interest} in ${destination || 'your destination'}`,
      summary: `A ${pace?.toLowerCase() || 'balanced'} day around ${interest} with budget-aware ideas (${budget || 'N/A'}).`,
      activities,
    }
  })

  // Simulate network latency to mirror future AI integration behavior.
  await new Promise((resolve) => setTimeout(resolve, 900))

  return { days }
}

async function generateTripItineraryGemini(input) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'

  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY')
  }

  const prompt = `
You are a travel itinerary planner.
Return ONLY valid JSON (no markdown, no comments) in this exact format:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "string",
      "summary": "string",
      "activities": [
        { "slot": "morning", "title": "string", "description": "string" },
        { "slot": "afternoon", "title": "string", "description": "string" },
        { "slot": "evening", "title": "string", "description": "string" }
      ]
    }
  ]
}

Generate itinerary using:
- destination: ${input.destination}
- startDate: ${input.startDate}
- endDate: ${input.endDate}
- budget: ${input.budget}
- interests: ${(input.interests || []).join(', ') || 'none'}
- pace: ${input.pace}
- notes: ${input.notes || 'none'}

Requirements:
- one day object per date from startDate to endDate
- keep suggestions practical and budget-aware
- activities must include morning, afternoon, evening
`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API request failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const jsonString = extractJsonFromText(text)
  if (!jsonString) {
    throw new Error('Gemini returned an empty or invalid response.')
  }

  const parsed = JSON.parse(jsonString)
  return {
    days: normalizeItineraryDays(parsed?.days, input.startDate, input.endDate),
  }
}

export async function generateTripItinerary(input) {
  try {
    return await generateTripItineraryGemini(input)
  } catch (error) {
    console.warn('Falling back to mock itinerary generator:', error)
    return generateTripItineraryMock(input)
  }
}

