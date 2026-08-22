/**
 * practiceRoutes.js
 * 
 * Express routes for the DSA Coding Practice Bank.
 * Supports 100 curated DSA questions across all topics, test case execution, and session progress.
 */

'use strict';

const express = require('express');
const router = express.Router();
const { simulateCodeRun } = require('../services/geminiService');
const { logger } = require('../middleware/logger');

// 100 Curated DSA Questions Seed Data
const rawQuestions = [
  "1|Basics|Check whether a number is even or odd.|4|Even|5|Odd",
  "2|Basics|Find the largest of three numbers.|1 2 3|3|5 2 1|5",
  "3|Basics|Check whether a given year is a leap year.|2020|Leap|2023|Not Leap",
  "4|Loops|Find the sum of the first N natural numbers.|5|15|10|55",
  "5|Loops|Print the multiplication table of a given number.|3|3 6 9 12 15 18 21 24 27 30|5|5 10 15 20 25 30 35 40 45 50",
  "6|Numbers|Count the number of digits in a number.|12345|5|987|3",
  "7|Numbers|Reverse a number.|123|321|-456|-654",
  "8|Numbers|Check whether a number is a palindrome.|121|True|123|False",
  "9|Numbers|Check whether a number is prime.|7|True|10|False",
  "10|Numbers|Generate the Fibonacci series up to N terms.|5|0 1 1 2 3|7|0 1 1 2 3 5 8",
  "11|Numbers|Find the factorial of a number.|5|120|3|6",
  "12|Numbers|Find the GCD of two numbers.|12 15|3|20 10|10",
  "13|Numbers|Find the LCM of two numbers.|12 15|60|4 6|12",
  "14|Numbers|Check whether a number is an Armstrong number.|153|True|123|False",
  "15|Numbers|Find the sum of digits of a number.|123|6|456|15",
  "16|Numbers|Find the product of digits of a number.|123|6|456|120",
  "17|Numbers|Count the even and odd digits in a number.|1234|2 2|135|0 3",
  "18|Numbers|Find all divisors of a number.|12|1 2 3 4 6 12|7|1 7",
  "19|Numbers|Count the number of prime numbers in a given range.|1 10|4|10 20|4",
  "20|Numbers|Calculate the power of a number efficiently.|2 3|8|3 4|81",
  "21|Array|Find the sum of all elements in an array.|5\\n1 2 3 4 5|15|3\\n10 20 30|60",
  "22|Array|Find the largest element in an array.|5\\n1 5 3 4 2|5|3\\n10 20 30|30",
  "23|Array|Find the smallest element in an array.|5\\n1 5 3 4 2|1|3\\n10 20 30|10",
  "24|Array|Find the second largest element in an array.|5\\n1 5 3 4 2|4|3\\n10 20 30|20",
  "25|Array|Find the second smallest element in an array.|5\\n1 5 3 4 2|2|3\\n10 20 30|20",
  "26|Array|Reverse an array.|5\\n1 2 3 4 5|5 4 3 2 1|3\\n10 20 30|30 20 10",
  "27|Array|Count even and odd elements in an array.|5\\n1 2 3 4 5|2 3|3\\n10 20 30|3 0",
  "28|Array|Find the frequency of a given element in an array.|5\\n1 2 2 4 5\\n2|2|3\\n10 20 30\\n20|1",
  "29|Array|Check whether an array is sorted.|5\\n1 2 3 4 5|True|5\\n1 5 3 4 2|False",
  "30|Array|Search for an element using linear search.|5\\n1 2 3 4 5\\n3|2|5\\n1 2 3 4 5\\n6|-1",
  "31|Array|Remove duplicates from a sorted array.|5\\n1 1 2 2 3|1 2 3|4\\n1 1 1 1|1",
  "32|Array|Move all zeros to the end of an array.|5\\n1 0 2 0 3|1 2 3 0 0|4\\n0 0 1 2|1 2 0 0",
  "33|Array|Separate even and odd numbers in an array.|5\\n1 2 3 4 5|2 4 1 3 5|4\\n1 3 2 4|2 4 1 3",
  "34|Array|Rotate an array by one position.|5\\n1 2 3 4 5|5 1 2 3 4|3\\n10 20 30|30 10 20",
  "35|Array|Rotate an array by K positions.|5\\n1 2 3 4 5\\n2|4 5 1 2 3|4\\n1 2 3 4\\n1|4 1 2 3",
  "36|Array|Find the missing number from an array containing numbers from 1 to N.|4\\n1 2 4|3|5\\n1 2 3 5|4",
  "37|Array|Find the duplicate element in an array.|5\\n1 2 3 4 2|2|4\\n1 1 2 3|1",
  "38|Array|Find common elements in two arrays.|5\\n1 2 3 4 5\\n3\\n3 4 5|3 4 5|3\\n1 2 3\\n2\\n4 5|None",
  "39|Array|Merge two sorted arrays.|3\\n1 3 5\\n3\\n2 4 6|1 2 3 4 5 6|2\\n1 2\\n2\\n3 4|1 2 3 4",
  "40|Array|Find the maximum subarray sum.|5\\n-2 1 -3 4 -1|4|5\\n1 2 3 4 5|15",
  "41|String|Find the length of a string without using a built-in length function.|hello|5|world|5",
  "42|String|Reverse a string.|hello|olleh|world|dlrow",
  "43|String|Check whether a string is a palindrome.|radar|True|hello|False",
  "44|String|Count vowels and consonants in a string.|hello|2 3|world|1 4",
  "45|String|Count uppercase and lowercase characters in a string.|HeLLo|2 3|WoRLD|4 1",
  "46|String|Count digits and special characters in a string.|a1@b2#|2 2|h3llo!|1 1",
  "47|String|Find the frequency of each character in a string.|hello|h:1 e:1 l:2 o:1|world|w:1 o:1 r:1 l:1 d:1",
  "48|String|Remove spaces from a string.|hello world|helloworld|a b c|abc",
  "49|String|Remove duplicate characters from a string.|hello|helo|world|world",
  "50|String|Find the first non-repeating character in a string.|hello|h|swiss|w",
  "51|String|Check whether two strings are anagrams.|listen silent|True|hello world|False",
  "52|String|Count the number of words in a sentence.|hello world|2|a b c|3",
  "53|String|Reverse the words in a sentence.|hello world|world hello|a b c|c b a",
  "54|String|Find the longest word in a sentence.|hello world|hello|a quick brown fox|quick",
  "55|String|Check whether one string is a rotation of another.|waterbottle erbottlewat|True|hello world|False",
  "56|Searching|Implement linear search.|5\\n1 2 3 4 5\\n3|2|5\\n1 2 3 4 5\\n6|-1",
  "57|Searching|Implement binary search on a sorted array.|5\\n1 2 3 4 5\\n4|3|5\\n1 2 3 4 5\\n6|-1",
  "58|Searching|Find the first occurrence of an element in a sorted array.|5\\n1 2 2 2 3\\n2|1|4\\n1 1 1 1\\n1|0",
  "59|Searching|Find the last occurrence of an element in a sorted array.|5\\n1 2 2 2 3\\n2|3|4\\n1 1 1 1\\n1|3",
  "60|Searching|Count the occurrences of a number in a sorted array.|5\\n1 2 2 2 3\\n2|3|4\\n1 1 1 1\\n2|0",
  "61|Sorting|Implement bubble sort.|5\\n5 4 3 2 1|1 2 3 4 5|3\\n3 1 2|1 2 3",
  "62|Sorting|Implement selection sort.|5\\n5 4 3 2 1|1 2 3 4 5|3\\n3 1 2|1 2 3",
  "63|Sorting|Implement insertion sort.|5\\n5 4 3 2 1|1 2 3 4 5|3\\n3 1 2|1 2 3",
  "64|Sorting|Check whether an array is already sorted.|5\\n1 2 3 4 5|True|5\\n5 4 3 2 1|False",
  "65|Sorting|Sort an array of 0s, 1s, and 2s (Dutch National Flag problem).|6\\n0 1 2 0 1 2|0 0 1 1 2 2|3\\n2 0 1|0 1 2",
  "66|Hashing|Find the frequency of each element in an array.|5\\n1 2 2 3 3|1:1 2:2 3:2|3\\n1 1 1|1:3",
  "67|Hashing|Find the first repeating element in an array.|5\\n1 2 3 2 1|1|4\\n1 2 3 4|None",
  "68|Hashing|Find all non-repeating elements in an array.|5\\n1 2 2 3 4|1 3 4|3\\n1 1 1|None",
  "69|Hashing|Check whether two arrays are equal using frequency map.|3\\n1 2 3\\n3\\n3 2 1|True|2\\n1 2\\n2\\n2 3|False",
  "70|Hashing|Find a pair of elements that sum up to a target value.|5\\n1 2 3 4 5\\n9|4 5|4\\n1 2 3 4\\n10|None",
  "71|Two Pointers|Check whether a string is a palindrome using two pointers.|racecar|True|hello|False",
  "72|Two Pointers|Reverse an array using two pointers.|5\\n1 2 3 4 5|5 4 3 2 1|4\\n10 20 30 40|40 30 20 10",
  "73|Two Pointers|Move all negative numbers to the beginning of an array.|5\\n-1 2 -3 4 5|-1 -3 2 4 5|3\\n1 -2 3|-2 1 3",
  "74|Two Pointers|Remove duplicates from a sorted array using two pointers.|5\\n1 1 2 2 3|1 2 3|3\\n1 1 1|1",
  "75|Two Pointers|Find if a pair with a given sum exists in a sorted array.|5\\n1 2 3 4 5\\n7|True|4\\n1 2 3 4\\n8|False",
  "76|Prefix Sum|Compute the prefix sum array of a given array.|5\\n1 2 3 4 5|1 3 6 10 15|3\\n2 4 6|2 6 12",
  "77|Prefix Sum|Find the sum of elements in a range [L, R] using prefix sums.|5\\n1 2 3 4 5\\n1 3|9|4\\n2 4 6 8\\n0 2|12",
  "78|Prefix Sum|Find the equilibrium index of an array.|5\\n1 3 5 2 2|2|3\\n1 2 3|-1",
  "79|Prefix Sum|Check if an array can be split into two parts with equal sum.|4\\n1 2 3 3|True|4\\n1 2 3 4|False",
  "80|Prefix Sum|Find the highest sum of a subarray of size K.|5\\n1 2 3 4 5\\n2|9|4\\n2 1 5 3\\n3|9",
  "81|Linked List|Create a singly linked list and print its elements.|3\\n1 2 3|1 -> 2 -> 3|2\\n10 20|10 -> 20",
  "82|Linked List|Insert a node at the beginning of a linked list.|3\\n1 2 3\\n0|0 -> 1 -> 2 -> 3|2\\n2 3\\n1|1 -> 2 -> 3",
  "83|Linked List|Insert a node at the end of a linked list.|3\\n1 2 3\\n4|1 -> 2 -> 3 -> 4|2\\n1 2\\n3|1 -> 2 -> 3",
  "84|Linked List|Delete the first node of a linked list.|3\\n1 2 3|2 -> 3|2\\n1 2|2",
  "85|Linked List|Delete the last node of a linked list.|3\\n1 2 3|1 -> 2|2\\n1 2|1",
  "86|Linked List|Search for an element in a linked list.|3\\n1 2 3\\n2|True|3\\n1 2 3\\n5|False",
  "87|Linked List|Find the length of a linked list.|3\\n1 2 3|3|1\\n10|1",
  "88|Linked List|Reverse a singly linked list.|3\\n1 2 3|3 -> 2 -> 1|2\\n10 20|20 -> 10",
  "89|Linked List|Find the middle element of a linked list.|5\\n1 2 3 4 5|3|4\\n1 2 3 4|3",
  "90|Linked List|Check whether a linked list contains a cycle.|3\\n1 2 3|False|1\\n1|False",
  "91|Stack|Implement a stack using an array.|push 1, push 2, pop|2|push 5, pop|5",
  "92|Stack|Check for balanced parentheses in an expression.|{()}()|True|{(})|False",
  "93|Stack|Reverse a string using a stack.|hello|olleh|code|edoc",
  "94|Stack|Evaluate a postfix expression.|2 3 + 4 *|20|5 2 -|3",
  "95|Stack|Find the next greater element for each element in an array.|4\\n4 5 2 25|5 25 25 -1|3\\n1 3 2|3 -1 -1",
  "96|Queue|Implement a queue using an array.|enqueue 1, enqueue 2, dequeue|1|enqueue 5, dequeue|5",
  "97|Queue|Implement a circular queue.|enqueue 1, enqueue 2, dequeue, enqueue 3|1|enqueue 10, dequeue|10",
  "98|Queue|Generate binary numbers from 1 to N using a queue.|3|1 10 11|5|1 10 11 100 101",
  "99|Queue|Reverse the first K elements of a queue.|5\\n1 2 3 4 5\\n3|3 2 1 4 5|4\\n10 20 30 40\\n2|20 10 30 40",
  "100|Queue|Implement a stack using queues.|push 1, push 2, pop|2|push 10, pop|10"
];

function getStarterCode(category) {
  if (['Basics', 'Loops', 'Numbers'].includes(category)) {
    return {
      python: `import sys\ninput = sys.stdin.readline\n\n# Read input\nn = int(input())\n\n# Write your solution below\n`,
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nlet idx = 0;\nconst n = parseInt(lines[idx++]);\n// Write your solution below\n`,
      java: `import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your solution below\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    // Write your solution below\n    return 0;\n}`
    };
  } else if (category === 'String') {
    return {
      python: `import sys\ninput = sys.stdin.readline\n\n# Read input\ns = input().strip()\n\n# Write your solution below\n`,
      javascript: `const s = require('fs').readFileSync(0, 'utf8').trim();\n// Write your solution below\n`,
      java: `import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Write your solution below\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s;\n    cin >> s;\n    // Write your solution below\n    return 0;\n}`
    };
  } else {
    return {
      python: `import sys\ninput = sys.stdin.readline\n\n# Read input\nn = int(input())\narr = list(map(int, input().split()))\n\n# Write your solution below\n`,
      javascript: `const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nlet idx = 0;\nconst n = parseInt(lines[idx++]);\nconst arr = lines[idx++].split(' ').map(Number);\n// Write your solution below\n`,
      java: `import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i=0; i<n; i++) arr[i] = sc.nextInt();\n        // Write your solution below\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i=0; i<n; i++) cin >> arr[i];\n    // Write your solution below\n    return 0;\n}`
    };
  }
}

// In-memory Database of 100 Questions
const QUESTIONS_DB = rawQuestions.map(item => {
  const parts = item.split('|');
  const qId = parseInt(parts[0]);
  const category = parts[1];
  const title = parts[2];
  const input1 = (parts[3] || '').replace(/\\n/g, '\n');
  const output1 = (parts[4] || '').replace(/\\n/g, '\n');
  const input2 = (parts[5] || '').replace(/\\n/g, '\n');
  const output2 = (parts[6] || '').replace(/\\n/g, '\n');

  return {
    questionId: qId,
    title,
    category,
    difficulty: 'Beginner',
    description: `### Problem Description\n\n${title}\n\n### Input Format\nRead input from standard input (stdin).\n\n### Output Format\nPrint result to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB`,
    sampleTestCases: [
      { input: input1, expectedOutput: output1 },
      { input: input2, expectedOutput: output2 }
    ],
    hiddenTestCases: [
      { input: input1, expectedOutput: output1 },
      { input: input2, expectedOutput: output2 }
    ],
    starterCode: getStarterCode(category),
    supportedLanguages: ['Python', 'JavaScript', 'Java', 'C++'],
    isActive: true
  };
});

// Session solved storage in memory
const sessionSolvedMap = new Map();

// ── GET /api/practice/questions ───────────────────────────────────────────
router.get('/questions', (req, res) => {
  const { difficulty = 'Beginner', category = 'All', page = 1, limit = 20 } = req.query;
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.max(1, parseInt(limit) || 20);

  let filtered = QUESTIONS_DB;
  if (category && category !== 'All') {
    filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }

  const total = filtered.length;
  const skip = (p - 1) * l;
  const questions = filtered.slice(skip, skip + l).map(q => ({
    questionId: q.questionId,
    title: q.title,
    category: q.category,
    difficulty: q.difficulty,
    isActive: q.isActive
  }));

  res.json({
    ok: true,
    questions,
    total,
    page: p,
    totalPages: Math.ceil(total / l)
  });
});

// ── GET /api/practice/questions/:questionId ───────────────────────────────
router.get('/questions/:questionId', (req, res) => {
  const qId = parseInt(req.params.questionId);
  const question = QUESTIONS_DB.find(q => q.questionId === qId);

  if (!question) {
    return res.status(404).json({ error: { message: 'Question not found' } });
  }

  // Return question without hidden test cases
  const { hiddenTestCases, ...safeQuestion } = question;
  res.json(safeQuestion);
});

// ── GET /api/practice/stats ───────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const { difficulty = 'Beginner', session_id = '' } = req.query;
  const total = QUESTIONS_DB.length;
  const solvedSet = sessionSolvedMap.get(session_id) || new Set();
  const solved = solvedSet.size;

  const categories = [...new Set(QUESTIONS_DB.map(q => q.category))];

  res.json({
    total,
    solved,
    attempted: solved,
    remaining: Math.max(0, total - solved),
    categories
  });
});

// ── POST /api/practice/run ────────────────────────────────────────────────
router.post('/run', async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    const question = QUESTIONS_DB.find(q => q.questionId === parseInt(questionId));

    if (!question) {
      return res.status(404).json({ error: { message: 'Question not found' } });
    }

    const testPromises = question.sampleTestCases.map(async (tc, i) => {
      const execResult = await simulateCodeRun(code, language, tc.input);
      const cleanActual = (execResult.stdout || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanExpected = (tc.expectedOutput || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const passed = (!execResult.stderr || execResult.stderr === '') && (cleanActual === cleanExpected || cleanActual.includes(cleanExpected));

      return {
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: execResult.stdout || execResult.stderr,
        passed,
        executionTimeMs: 45
      };
    });

    const results = await Promise.all(testPromises);

    res.json({
      ok: true,
      allPassed: results.every(r => r.passed),
      results
    });
  } catch (err) {
    logger.error('practice_run_error', { err: err.message });
    res.status(500).json({ error: { message: err.message } });
  }
});

// ── POST /api/practice/submit ─────────────────────────────────────────────
router.post('/submit', async (req, res) => {
  try {
    const { questionId, code, language, sessionId = '' } = req.body;
    const question = QUESTIONS_DB.find(q => q.questionId === parseInt(questionId));

    if (!question) {
      return res.status(404).json({ error: { message: 'Question not found' } });
    }

    const allTestCases = [...question.sampleTestCases, ...question.hiddenTestCases];

    const testPromises = allTestCases.map(async (tc, i) => {
      const execResult = await simulateCodeRun(code, language, tc.input);
      const cleanActual = (execResult.stdout || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanExpected = (tc.expectedOutput || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const passed = (!execResult.stderr || execResult.stderr === '') && (cleanActual === cleanExpected || cleanActual.includes(cleanExpected));

      return {
        testCaseIndex: i + 1,
        input: i < 2 ? tc.input : '[Hidden]',
        expectedOutput: i < 2 ? tc.expectedOutput : '[Hidden]',
        actualOutput: i < 2 ? (execResult.stdout || execResult.stderr) : (passed ? '[Hidden - Passed]' : '[Hidden - Failed]'),
        passed,
        executionTimeMs: 42
      };
    });

    const results = await Promise.all(testPromises);
    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === allTestCases.length;
    const verdict = allPassed ? 'Accepted' : 'Wrong Answer';

    if (allPassed && sessionId) {
      if (!sessionSolvedMap.has(sessionId)) {
        sessionSolvedMap.set(sessionId, new Set());
      }
      sessionSolvedMap.get(sessionId).add(parseInt(questionId));
    }

    res.json({
      ok: true,
      verdict,
      allPassed,
      passedCount,
      totalCount: allTestCases.length,
      message: allPassed ? 'Congratulations! All test cases passed.' : `Passed ${passedCount} of ${allTestCases.length} test cases.`,
      results
    });
  } catch (err) {
    logger.error('practice_submit_error', { err: err.message });
    res.status(500).json({ error: { message: err.message } });
  }
});

module.exports = router;
