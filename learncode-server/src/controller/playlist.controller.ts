import { db } from '../libs/db.js'
import type { Request, Response } from 'express'

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body

    const userId = req.user?.id

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to create a playlist' })
    }

    const playList = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    })

    res.status(200).json({
      success: true,
      message: 'Playlist created successfully',
      playList,
    })
  } catch (error) {
    console.error('Error creating playlist:', error)
    res.status(500).json({ error: 'Failed to create playlist' })
  }
}

export const getAllListDetails = async (req: Request, res: Response) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userId: req.user?.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    })

    res.status(200).json({
      success: true,
      message: 'Playlist fetched successfully',
      playlists,
    })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    res.status(500).json({ error: 'Failed to fetch playlist' })
  }
}

export const getPlayListDetails = async (req: Request, res: Response) => {
  const { playlistId } = req.params
  try {
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user?.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    })

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' })
    }
    res.status(200).json({
      success: true,
      message: 'Playlist fetched successfully',
      playlist,
    })
  } catch (error) {
    console.error('Error fetching playlist:', error)
    res.status(500).json({ error: 'Failed to fetch playlist' })
  }
}

export const addProblemToPlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params
  const { problemIds } = req.body

  try {
    if (!playlistId || typeof playlistId !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing playlistId' })
    }

    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing problemsId' })
    }

    // Create records for each problem in the playlist
    const problemsInPlaylist = await db.problemsInPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playlistId: playlistId,
        problemId,
      })),
    })

    res.status(201).json({
      success: true,
      message: 'Problems added to playlist successfully',
      problemsInPlaylist,
    })
  } catch (error: unknown) {
    console.error('Error adding problem to playlist:', error instanceof Error ? error.message : String(error))
    res.status(500).json({ error: 'Failed to add problem to playlist' })
  }
}

export const deletePlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    })

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully',
      deletedPlaylist,
    })
  } catch (error: unknown) {
    console.error('Error deleting playlist:', error instanceof Error ? error.message : String(error))
    res.status(500).json({ error: 'Failed to delete playlist' })
  }
}

export const removeProblemFromPlaylist = async (req: Request, res: Response) => {
  const { playlistId } = req.params
  const { problemIds } = req.body

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing problemsId' })
    }

    const deletedProblem = await db.problemsInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    })

    res.status(200).json({
      success: true,
      message: 'Problem removed from playlist successfully',
      deletedProblem,
    })
  } catch (error) {
    console.error(
      'Error removing problem from playlist:',
      error instanceof Error ? error.message : String(error)
    )
    res.status(500).json({ error: 'Failed to remove problem from playlist' })
  }
}
