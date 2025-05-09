import type { Request, Response } from 'express'
import db from '../libs/db'

export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
      },
    })
    return res.status(200).json({
      success: true,
      MessageChannel: 'Submissions count fetched successfully',
      submissions,
    })
  } catch (error) {
    console.error('Error fetching submissions count:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getSubmissionsById = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params
    const userId = req.user?.id

    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
    })

    if (!submissions) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    return res.status(200).json({
      success: true,
      message: 'Submissions fetched successfully',
      submissions,
    })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getSubmissionsCount = async (req: Request, res: Response) => {
  try {
    const problemId = req.params.problemId

    const submission = await db.submission.count({
      where: {
        problemId: problemId,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Submissions fetched successfully',
      count: submission,
    })
  } catch (error) {
    console.error('Error fetching all submissions:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
