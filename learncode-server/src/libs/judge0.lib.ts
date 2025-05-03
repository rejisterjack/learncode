import axios from 'axios'

export const getJudge0LanguageId = (language: string): number | null => {
  const languageMap: Record<string, number> = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  }

  return languageMap[language.toUpperCase()] || null
}

export const submitBatch = async (submissions: any[]) => {
  const { data } = await axios.post(
    'https://api.judge0.com/submissions/batch',
    {
      submissions,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  return data
}
