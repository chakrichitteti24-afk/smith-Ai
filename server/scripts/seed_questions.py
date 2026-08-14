#!/usr/bin/env python3
"""
server/scripts/seed_questions.py
One-shot seeder: inserts all 100 Beginner DSA questions into MongoDB.
Usage: python server/scripts/seed_questions.py
"""
import asyncio
import os
import sys

# Add server directory to path
server_dir = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, server_dir)

from database import db

def get_starter_code(category):
    if category in ['Basics', 'Loops', 'Numbers']:
        return {
            "python": "import sys\ninput = sys.stdin.readline\n\n# Read input\nn = int(input())\n\n# Write your solution below\n",
            "javascript": "const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nlet idx = 0;\nconst n = parseInt(lines[idx++]);\n// Write your solution below\n",
            "java": "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your solution below\n    }\n}",
            "c": "#include <stdio.h>\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    // Write your solution below\n    return 0;\n}",
            "cpp": "#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    // Write your solution below\n    return 0;\n}"
        }
    elif category == 'String':
        return {
            "python": "import sys\ninput = sys.stdin.readline\n\n# Read input\ns = input().strip()\n\n# Write your solution below\n",
            "javascript": "const s = require('fs').readFileSync(0, 'utf8').trim();\n// Write your solution below\n",
            "java": "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Write your solution below\n    }\n}",
            "c": "#include <stdio.h>\nint main() {\n    char s[1000];\n    scanf(\"%s\", s);\n    // Write your solution below\n    return 0;\n}",
            "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s;\n    cin >> s;\n    // Write your solution below\n    return 0;\n}"
        }
    else:
        return {
            "python": "import sys\ninput = sys.stdin.readline\n\n# Read input\nn = int(input())\narr = list(map(int, input().split()))\n\n# Write your solution below\n",
            "javascript": "const lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');\nlet idx = 0;\nconst n = parseInt(lines[idx++]);\nconst arr = lines[idx++].split(' ').map(Number);\n// Write your solution below\n",
            "java": "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i=0; i<n; i++) arr[i] = sc.nextInt();\n        // Write your solution below\n    }\n}",
            "c": "#include <stdio.h>\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    int arr[1000];\n    for(int i=0; i<n; i++) scanf(\"%d\", &arr[i]);\n    // Write your solution below\n    return 0;\n}",
            "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i=0; i<n; i++) cin >> arr[i];\n    // Write your solution below\n    return 0;\n}"
        }

raw_questions = [
    # Format: id | Category | Title | input1 | output1 | input2 | output2
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
    "57|Searching|Implement binary search.|5\\n1 2 3 4 5\\n4|3|5\\n1 2 3 4 5\\n6|-1",
    "58|Searching|Find the first occurrence of an element in a sorted array.|5\\n1 2 2 2 3\\n2|1|5\\n1 2 3 4 5\\n6|-1",
    "59|Searching|Find the last occurrence of an element in a sorted array.|5\\n1 2 2 2 3\\n2|3|5\\n1 2 3 4 5\\n6|-1",
    "60|Searching|Count the occurrences of an element in a sorted array.|5\\n1 2 2 2 3\\n2|3|5\\n1 2 3 4 5\\n6|0",
    "61|Sorting|Implement bubble sort.|5\\n5 4 3 2 1|1 2 3 4 5|5\\n1 2 3 4 5|1 2 3 4 5",
    "62|Sorting|Implement selection sort.|5\\n5 4 3 2 1|1 2 3 4 5|5\\n1 2 3 4 5|1 2 3 4 5",
    "63|Sorting|Implement insertion sort.|5\\n5 4 3 2 1|1 2 3 4 5|5\\n1 2 3 4 5|1 2 3 4 5",
    "64|Sorting|Implement merge sort.|5\\n5 4 3 2 1|1 2 3 4 5|5\\n1 2 3 4 5|1 2 3 4 5",
    "65|Sorting|Implement quick sort.|5\\n5 4 3 2 1|1 2 3 4 5|5\\n1 2 3 4 5|1 2 3 4 5",
    "66|Sorting|Sort an array containing only 0s and 1s.|5\\n1 0 1 0 1|0 0 1 1 1|4\\n0 0 0 0|0 0 0 0",
    "67|Hashing|Find the Kth smallest element in an array.|5\\n5 4 3 2 1\\n2|2|5\\n1 2 3 4 5\\n3|3",
    "68|Hashing|Find the frequency of every element in an array.|5\\n1 2 2 3 3|1:1 2:2 3:2|4\\n1 1 1 1|1:4",
    "69|Hashing|Find all duplicate elements in an array.|5\\n1 2 2 3 3|2 3|4\\n1 2 3 4|None",
    "70|Hashing|Find the first repeating element in an array.|5\\n1 2 3 2 1|1|4\\n1 2 3 4|None",
    "71|Hashing|Find the first non-repeating element in an array.|5\\n1 2 3 2 1|3|4\\n1 1 2 2|None",
    "72|Hashing|Find the element with the maximum frequency.|5\\n1 2 2 3 3|2|4\\n1 1 1 2|1",
    "73|Hashing|Find the element with the minimum frequency.|5\\n1 2 2 3 3|1|4\\n1 1 1 2|2",
    "74|Hashing|Check whether two arrays contain the same elements.|5\\n1 2 3 4 5\\n5\\n5 4 3 2 1|True|3\\n1 2 3\\n3\\n1 2 4|False",
    "75|Two Pointers|Find two elements in a sorted array whose sum equals a given target.|5\\n1 2 3 4 5\\n5|2 3|5\\n1 2 3 4 5\\n10|None",
    "76|Two Pointers|Find the intersection of two sorted arrays.|5\\n1 2 3 4 5\\n3\\n3 4 5|3 4 5|3\\n1 2 3\\n3\\n4 5 6|None",
    "77|Two Pointers|Find the union of two sorted arrays.|5\\n1 2 3 4 5\\n3\\n3 4 5|1 2 3 4 5|3\\n1 2 3\\n3\\n4 5 6|1 2 3 4 5 6",
    "78|Two Pointers|Remove duplicates from a sorted array using two pointers.|5\\n1 1 2 2 3|1 2 3|4\\n1 1 1 1|1",
    "79|Two Pointers|Reverse an array using two pointers.|5\\n1 2 3 4 5|5 4 3 2 1|3\\n10 20 30|30 20 10",
    "80|Two Pointers|Check whether a string is a palindrome using two pointers.|radar|True|hello|False",
    "81|Prefix Sum|Answer multiple range-sum queries on an array.|5\\n1 2 3 4 5\\n2\\n0 2\\n1 4|6\\n14|4\\n1 1 1 1\\n1\\n0 3|4",
    "82|Linked List|Create and traverse a singly linked list.|5\\n1 2 3 4 5|1 2 3 4 5|3\\n10 20 30|10 20 30",
    "83|Linked List|Insert a node at the beginning of a linked list.|5\\n1 2 3 4 5\\n0|0 1 2 3 4 5|3\\n10 20 30\\n5|5 10 20 30",
    "84|Linked List|Insert a node at the end of a linked list.|5\\n1 2 3 4 5\\n6|1 2 3 4 5 6|3\\n10 20 30\\n40|10 20 30 40",
    "85|Linked List|Delete a node from a linked list.|5\\n1 2 3 4 5\\n3|1 2 4 5|3\\n10 20 30\\n20|10 30",
    "86|Linked List|Search for an element in a linked list.|5\\n1 2 3 4 5\\n3|True|5\\n1 2 3 4 5\\n6|False",
    "87|Linked List|Reverse a singly linked list.|5\\n1 2 3 4 5|5 4 3 2 1|3\\n10 20 30|30 20 10",
    "88|Linked List|Find the middle element of a linked list.|5\\n1 2 3 4 5|3|4\\n1 2 3 4|2",
    "89|Stack|Implement a stack using an array or list.|5\\n1 2 3 4 5|5 4 3 2 1|3\\n10 20 30|30 20 10",
    "90|Stack|Reverse a string using a stack.|hello|olleh|world|dlrow",
    "91|Stack|Check whether parentheses are balanced.|()[]{}|True|(]|False",
    "92|Queue|Implement a queue using an array or list.|5\\n1 2 3 4 5|1 2 3 4 5|3\\n10 20 30|10 20 30",
    "93|Queue|Implement a circular queue.|5\\n1 2 3 4 5|1 2 3 4 5|3\\n10 20 30|10 20 30",
    "94|Mixed|Implement a stack using two queues.|5\\n1 2 3 4 5|5 4 3 2 1|3\\n10 20 30|30 20 10",
    "95|Mixed|Find all leaders in an array.|5\\n16 17 4 3 5 2|17 5 2|4\\n1 2 3 4|4",
    "96|Mixed|Find the majority element in an array.|5\\n2 2 1 1 1 2 2|2|3\\n1 1 2|1",
    "97|Mixed|Find the maximum profit from buying and selling a stock once.|6\\n7 1 5 3 6 4|5|5\\n7 6 4 3 1|0",
    "98|Mixed|Find the longest consecutive sequence in an array.|6\\n100 4 200 1 3 2|4|5\\n1 2 3 4 5|5",
    "99|Mixed|Find the pair of elements with the minimum absolute difference.|5\\n4 2 1 3 5|1 2\\n2 3\\n3 4\\n4 5|4\\n1 5 8 9|8 9",
    "100|Mixed|Find the maximum and minimum elements using the minimum number of comparisons.|5\\n1 2 3 4 5|5 1|3\\n10 20 30|30 10"
]

def parse_question(raw_str):
    parts = raw_str.split('|')
    q_id = int(parts[0])
    category = parts[1]
    title = parts[2]
    ex1_in = parts[3].replace('\\n', '\n')
    ex1_out = parts[4].replace('\\n', '\n')
    ex2_in = parts[5].replace('\\n', '\n')
    ex2_out = parts[6].replace('\\n', '\n')
    
    doc = {
        "questionId": q_id,
        "module": "practice",
        "title": title,
        "category": category,
        "difficulty": "Beginner",
        "description": f"Write a complete program to solve the following problem: {title} You should ensure your code handles standard edge cases and follows appropriate time and space complexity constraints.",
        "examples": [
            {
                "input": ex1_in,
                "output": ex1_out,
                "explanation": f"The output for the given input is {ex1_out}."
            },
            {
                "input": ex2_in,
                "output": ex2_out,
                "explanation": f"The output for the given input is {ex2_out}."
            }
        ],
        "constraints": [
            "1 <= N <= 10^5",
            "Elements can be up to 10^9",
            "Memory Limit: 256 MB",
            "Time Limit: 1.0s"
        ],
        "supportedLanguages": ["Python", "JavaScript", "Java", "C", "C++"],
        "starterCode": get_starter_code(category),
        "testCases": [
            {
                "input": ex1_in,
                "expectedOutput": ex1_out
            },
            {
                "input": ex2_in,
                "expectedOutput": ex2_out
            }
        ],
        "hiddenTestCases": [
            {
                "input": ex1_in,
                "expectedOutput": ex1_out
            },
            {
                "input": ex2_in,
                "expectedOutput": ex2_out
            }
        ],
        "evaluation": {
            "correctness": True,
            "timeComplexity": True,
            "spaceComplexity": False,
            "edgeCases": True
        },
        "isActive": True
    }
    return doc

async def seed_db():
    print("Clearing existing beginner practice questions...")
    await db.practice_questions.delete_many({"difficulty": "Beginner", "module": "practice"})
    print("Cleared existing questions.")

    questions = [parse_question(q) for q in raw_questions]
    
    print(f"Inserting {len(questions)} new questions...")
    count = await db.practice_questions.insert_many(questions)
    print(f"Successfully inserted {count} questions into database!")

if __name__ == "__main__":
    asyncio.run(seed_db())
