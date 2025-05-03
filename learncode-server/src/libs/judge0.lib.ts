import axios from 'axios'
import judgeApi from './axios.lib'

export const getJudge0LanguageId = (language: string): number | null => {
  const languageMap: Record<string, number> = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  }

  return languageMap[language.toUpperCase()] || null
}

export const submitBatch = async (submissions: any[]) => {
  const { data } = await judgeApi.post(
    '/submissions/batch?base64_encoded=false',
    {
      submissions,
    }
  )
  console.log('Submission results:', data)
  return data
}

export const pollBatchResults = async (tokens: string[]) => {
  while (true) {
    const { data } = await judgeApi.get(`/submissions/batch`, {
      params: {
        tokens: tokens.join(','),
        base64_encoded: false,
      },
    })

    const results = data.submissions

    const isAllDone = results.every(
      (result) => result.status.id !== 1 && result.status.id !== 2
    )

    if (isAllDone) {
      return results
    }

    await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for 2 seconds before polling again
  }
}
