import db from '../libs/db.js'
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from '../libs/judge0.lib.js'

export const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testCases,
      codeSnippets,
      referenceSolutions,
    } = req.body

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    if (!title || !description || !difficulty) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language)

      if (!languageId) {
        return res
          .status(400)
          .json({ message: `Invalid language: ${language}` })
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }))

      const submissionResults = await submitBatch(submissions)

      const tokens = submissionResults.map((result) => result.token)

      const results = await pollBatchResults(tokens)

      for (const result of results) {
        if (result.status.id !== 3) {
          return res.status(400).json({
            message: `Test case failed for language ${language}: ${result.status.description}`,
          })
        }
      }

      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testCases,
          codeSnippets,
          referenceSolutions,
          userId: req.user.id,
        },
      })

      return res.status(201).json({
        message: 'Problem created successfully',
        problem: newProblem,
      })
    }
  } catch (error) {
    console.error('Error creating problem:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getProblems = async (req, res) => {}

export const getProblemById = async (req, res) => {}

export const updateProblemById = async (req, res) => {}

export const deleteProblemById = async (req, res) => {}

export const getAllProblemsSolvedByUser = async (req, res) => {}
