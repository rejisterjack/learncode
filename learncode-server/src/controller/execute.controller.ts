import type { Request, Response } from 'express'
import {
  getJudge0LanguageName,
  pollBatchResults,
  submitBatch,
} from '../libs/judge0.lib'
import db from '../libs/db'

export const executeCode = async (req: Request, res: Response) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problem_id } =
      req.body

    if (!source_code || !language_id) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    if (!expected_outputs || expected_outputs.length === 0) {
      return res.status(400).json({ message: 'Expected outputs are required' })
    }

    if (!problem_id) {
      return res.status(400).json({ message: 'Problem ID is required' })
    }

    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // validate test cases
    if (
      !Array.isArray(stdin) ||
      !Array.isArray(expected_outputs) ||
      stdin.length === 0 ||
      expected_outputs.length === 0
    ) {
      return res.status(400).json({ message: 'Invalid test cases format' })
    }

    if (stdin.length !== expected_outputs.length) {
      return res
        .status(400)
        .json({ message: 'Mismatched test cases and expected outputs' })
    }

    const submissions = stdin.map((input, index) => ({
      source_code,
      language_id,
      stdin: input,
    }))

    const submitResponse = await submitBatch(submissions)

    const tokens: string[] = submitResponse.map(
      (result: { token: string }) => result.token
    )
    // const submissionResults = await Promise.all(
    //   tokens.map((token) => pollBatchResults([token]))
    // )

    const submissionResults = await pollBatchResults(tokens)

    console.log('Submission Results:', submissionResults)

    let allPassed = true
    const detailedResults = submissionResults.map((result, index) => {
      const stdout = result.stdout?.trim()
      const expected_output = expected_outputs[index]?.trim()
      const passed = stdout === expected_output

      if (!passed) {
        allPassed = false
      } 
      return {
        testCase: index + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr,
        compile_output: result.compile_output,
        status: result.status?.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} seconds` : undefined,
        exit_code: result.exit_code,
      }
    })

    const submission = await db.submission.create({
      data: {
        userId,
        problemId: problem_id,
        sourceCode: source_code,
        language: getJudge0LanguageName(language_id),
        stdin: stdin.join('\n'),
        stdout: JSON.stringify(
          detailedResults.map((result) => result.stdout).join('\n')
        ),
        stderr: detailedResults.some(
          (result) => result.stderr !== null && result.stderr !== undefined
        )
          ? JSON.stringify(
              detailedResults.map((result) => result.stderr).join('\n')
            )
          : null,
        compileOutput: detailedResults.some(
          (result) =>
            result.compile_output !== null &&
            result.compile_output !== undefined
        )
          ? JSON.stringify(
              detailedResults.map((result) => result.compile_output).join('\n')
            )
          : null,
        status: allPassed ? 'AC' : 'WA',
        memory: detailedResults.some(
          (result) => result.memory !== null && result.memory !== undefined
        )
          ? JSON.stringify(
              detailedResults.map((result) => result.memory).join('\n')
            )
          : null,
        time: detailedResults.some(
          (result) => result.time !== null && result.time !== undefined
        )
          ? JSON.stringify(
              detailedResults.map((result) => result.time).join('\n')
            )
          : null,
      },
    })

    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId: problem_id,
          },
        },
        update: {},
        create: {
          userId,
          problemId: problem_id,
        },
      })
    }

    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
      exitCode: result.exit_code,
    }))

    await db.testCaseResult.createMany({
      data: testCaseResults,
    })

    const submissionWithTestCases = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    })

    res.status(200).json({
      success: true,
      message: 'Code executed successfully',
      submissionWithTestCases,
    })
  } catch (error) {
    console.error('Error executing code:', error)
    res.status(500).json({ message: 'Error while executing code' })
  }
}
