import type { Request, Response } from 'express'
import db from '../libs/db.js'
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from '../libs/judge0.lib.js'

export const createProblem = async (req: Request, res: Response) => {
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

    if (req.user?.role !== 'ADMIN') {
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

      const submissions = testCases.map(
        ({ input, output }: { input: string; output: string }) => ({
          source_code: solutionCode,
          language_id: languageId,
          stdin: input,
          expected_output: output,
        })
      )

      const submissionResults = await submitBatch(submissions)

      const tokens: string[] = submissionResults.map(
        (result: { token: string }) => result.token
      )

      const results = await pollBatchResults(tokens)

      for (const result of results) {
        console.log('Submission result:', result)
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
        success: true,
        message: 'Problem created successfully',
        problem: newProblem,
      })
    }
  } catch (error) {
    console.error('Error creating problem:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getProblems = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const offset = (page - 1) * limit

    const problems = await db.problem.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    if (!problems || problems.length === 0) {
      return res.status(404).json({ message: 'No problems found' })
    }

    const totalProblems = await db.problem.count()

    res.status(200).json({
      success: true,
      message: 'Problem created successfully',
      problems,
      totalPages: Math.ceil(totalProblems / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching problems:', error)
    res.status(500).json({ message: 'Error while get problems' })
  }
}

export const getProblemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const problem = await db.problem.findUnique({
      where: { id },
    })

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Problem fetched successfully',
      problem,
    })
  } catch (error) {
    console.error('Error fetching problem:', error)
    res.status(500).json({ message: 'Error while get problem' })
  }
}

export const updateProblemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
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

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const problem = await db.problem.findUnique({
      where: { id },
    })

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' })
    }

    const updatedProblem = await db.problem.update({
      where: { id },
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
      },
    })

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      problem: updatedProblem,
    })
  } catch (error) {
    console.error('Error updating problem:', error)
    res.status(500).json({ message: 'Error while updating problem' })
  }
}

export const deleteProblemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const problem = await db.problem.findUnique({
      where: { id },
    })

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' })
    }

    await db.problem.delete({
      where: { id },
    })

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting problem:', error)
    res.status(500).json({ message: 'Error while deleting problem' })
  }
}

export const getAllProblemsSolvedByUser = async (
  req: Request,
  res: Response
) => {}
