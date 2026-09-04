export const STATIC_QUESTIONS = [
  {
    "questionId": 1,
    "title": "Check whether a number is even or odd.",
    "category": "Basics",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCheck whether a number is even or odd.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "4",
        "expectedOutput": "Even"
      },
      {
        "input": "5",
        "expectedOutput": "Odd"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "4",
        "expectedOutput": "Even"
      },
      {
        "input": "5",
        "expectedOutput": "Odd"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 2,
    "title": "Find the largest of three numbers.",
    "category": "Basics",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the largest of three numbers.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "1 2 3",
        "expectedOutput": "3"
      },
      {
        "input": "5 2 1",
        "expectedOutput": "5"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "1 2 3",
        "expectedOutput": "3"
      },
      {
        "input": "5 2 1",
        "expectedOutput": "5"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 3,
    "title": "Check whether a given year is a leap year.",
    "category": "Basics",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCheck whether a given year is a leap year.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "2020",
        "expectedOutput": "Leap"
      },
      {
        "input": "2023",
        "expectedOutput": "Not Leap"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "2020",
        "expectedOutput": "Leap"
      },
      {
        "input": "2023",
        "expectedOutput": "Not Leap"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 4,
    "title": "Find the sum of the first N natural numbers.",
    "category": "Loops",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the sum of the first N natural numbers.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5",
        "expectedOutput": "15"
      },
      {
        "input": "10",
        "expectedOutput": "55"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5",
        "expectedOutput": "15"
      },
      {
        "input": "10",
        "expectedOutput": "55"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 5,
    "title": "Print the multiplication table of a given number.",
    "category": "Loops",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nPrint the multiplication table of a given number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3",
        "expectedOutput": "3 6 9 12 15 18 21 24 27 30"
      },
      {
        "input": "5",
        "expectedOutput": "5 10 15 20 25 30 35 40 45 50"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3",
        "expectedOutput": "3 6 9 12 15 18 21 24 27 30"
      },
      {
        "input": "5",
        "expectedOutput": "5 10 15 20 25 30 35 40 45 50"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 6,
    "title": "Count the number of digits in a number.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCount the number of digits in a number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "12345",
        "expectedOutput": "5"
      },
      {
        "input": "987",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "12345",
        "expectedOutput": "5"
      },
      {
        "input": "987",
        "expectedOutput": "3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 7,
    "title": "Reverse a number.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nReverse a number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "123",
        "expectedOutput": "321"
      },
      {
        "input": "-456",
        "expectedOutput": "-654"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "123",
        "expectedOutput": "321"
      },
      {
        "input": "-456",
        "expectedOutput": "-654"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 8,
    "title": "Check whether a number is a palindrome.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCheck whether a number is a palindrome.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "121",
        "expectedOutput": "True"
      },
      {
        "input": "123",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "121",
        "expectedOutput": "True"
      },
      {
        "input": "123",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 9,
    "title": "Check whether a number is prime.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCheck whether a number is prime.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "7",
        "expectedOutput": "True"
      },
      {
        "input": "10",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "7",
        "expectedOutput": "True"
      },
      {
        "input": "10",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 10,
    "title": "Generate the Fibonacci series up to N terms.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nGenerate the Fibonacci series up to N terms.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5",
        "expectedOutput": "0 1 1 2 3"
      },
      {
        "input": "7",
        "expectedOutput": "0 1 1 2 3 5 8"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5",
        "expectedOutput": "0 1 1 2 3"
      },
      {
        "input": "7",
        "expectedOutput": "0 1 1 2 3 5 8"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 11,
    "title": "Find the factorial of a number.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the factorial of a number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5",
        "expectedOutput": "120"
      },
      {
        "input": "3",
        "expectedOutput": "6"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5",
        "expectedOutput": "120"
      },
      {
        "input": "3",
        "expectedOutput": "6"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 12,
    "title": "Find the GCD of two numbers.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the GCD of two numbers.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "12 15",
        "expectedOutput": "3"
      },
      {
        "input": "20 10",
        "expectedOutput": "10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "12 15",
        "expectedOutput": "3"
      },
      {
        "input": "20 10",
        "expectedOutput": "10"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 13,
    "title": "Find the LCM of two numbers.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the LCM of two numbers.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "12 15",
        "expectedOutput": "60"
      },
      {
        "input": "4 6",
        "expectedOutput": "12"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "12 15",
        "expectedOutput": "60"
      },
      {
        "input": "4 6",
        "expectedOutput": "12"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 14,
    "title": "Check whether a number is an Armstrong number.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCheck whether a number is an Armstrong number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "153",
        "expectedOutput": "True"
      },
      {
        "input": "123",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "153",
        "expectedOutput": "True"
      },
      {
        "input": "123",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 15,
    "title": "Find the sum of digits of a number.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the sum of digits of a number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "123",
        "expectedOutput": "6"
      },
      {
        "input": "456",
        "expectedOutput": "15"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "123",
        "expectedOutput": "6"
      },
      {
        "input": "456",
        "expectedOutput": "15"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 16,
    "title": "Find the product of digits of a number.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the product of digits of a number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "123",
        "expectedOutput": "6"
      },
      {
        "input": "456",
        "expectedOutput": "120"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "123",
        "expectedOutput": "6"
      },
      {
        "input": "456",
        "expectedOutput": "120"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 17,
    "title": "Count the even and odd digits in a number.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCount the even and odd digits in a number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "1234",
        "expectedOutput": "2 2"
      },
      {
        "input": "135",
        "expectedOutput": "0 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "1234",
        "expectedOutput": "2 2"
      },
      {
        "input": "135",
        "expectedOutput": "0 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 18,
    "title": "Find all divisors of a number.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind all divisors of a number.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "12",
        "expectedOutput": "1 2 3 4 6 12"
      },
      {
        "input": "7",
        "expectedOutput": "1 7"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "12",
        "expectedOutput": "1 2 3 4 6 12"
      },
      {
        "input": "7",
        "expectedOutput": "1 7"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 19,
    "title": "Count the number of prime numbers in a given range.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCount the number of prime numbers in a given range.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "1 10",
        "expectedOutput": "4"
      },
      {
        "input": "10 20",
        "expectedOutput": "4"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "1 10",
        "expectedOutput": "4"
      },
      {
        "input": "10 20",
        "expectedOutput": "4"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 20,
    "title": "Calculate the power of a number efficiently.",
    "category": "Numbers",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCalculate the power of a number efficiently.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "2 3",
        "expectedOutput": "8"
      },
      {
        "input": "3 4",
        "expectedOutput": "81"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "2 3",
        "expectedOutput": "8"
      },
      {
        "input": "3 4",
        "expectedOutput": "81"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 21,
    "title": "Find the sum of all elements in an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the sum of all elements in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "15"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "60"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "15"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "60"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 22,
    "title": "Find the largest element in an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the largest element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "5"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "30"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "5"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "30"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 23,
    "title": "Find the smallest element in an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the smallest element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "1"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "1"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "10"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 24,
    "title": "Find the second largest element in an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the second largest element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "4"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "20"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "4"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "20"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 25,
    "title": "Find the second smallest element in an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the second smallest element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "2"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "20"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "2"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "20"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 26,
    "title": "Reverse an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nReverse an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "5 4 3 2 1"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "30 20 10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "5 4 3 2 1"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "30 20 10"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 27,
    "title": "Count even and odd elements in an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCount even and odd elements in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "2 3"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "3 0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "2 3"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "3 0"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 28,
    "title": "Find the frequency of a given element in an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nFind the frequency of a given element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 2 4 5\n2",
        "expectedOutput": "2"
      },
      {
        "input": "3\n10 20 30\n20",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 2 4 5\n2",
        "expectedOutput": "2"
      },
      {
        "input": "3\n10 20 30\n20",
        "expectedOutput": "1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 29,
    "title": "Check whether an array is sorted.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nCheck whether an array is sorted.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "True"
      },
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "True"
      },
      {
        "input": "5\n1 5 3 4 2",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 30,
    "title": "Search for an element using linear search.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nSearch for an element using linear search.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n3",
        "expectedOutput": "2"
      },
      {
        "input": "5\n1 2 3 4 5\n6",
        "expectedOutput": "-1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n3",
        "expectedOutput": "2"
      },
      {
        "input": "5\n1 2 3 4 5\n6",
        "expectedOutput": "-1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 31,
    "title": "Remove duplicates from a sorted array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nRemove duplicates from a sorted array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 1 2 2 3",
        "expectedOutput": "1 2 3"
      },
      {
        "input": "4\n1 1 1 1",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 1 2 2 3",
        "expectedOutput": "1 2 3"
      },
      {
        "input": "4\n1 1 1 1",
        "expectedOutput": "1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 32,
    "title": "Move all zeros to the end of an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nMove all zeros to the end of an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 0 2 0 3",
        "expectedOutput": "1 2 3 0 0"
      },
      {
        "input": "4\n0 0 1 2",
        "expectedOutput": "1 2 0 0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 0 2 0 3",
        "expectedOutput": "1 2 3 0 0"
      },
      {
        "input": "4\n0 0 1 2",
        "expectedOutput": "1 2 0 0"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 33,
    "title": "Separate even and odd numbers in an array.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nSeparate even and odd numbers in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "2 4 1 3 5"
      },
      {
        "input": "4\n1 3 2 4",
        "expectedOutput": "2 4 1 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "2 4 1 3 5"
      },
      {
        "input": "4\n1 3 2 4",
        "expectedOutput": "2 4 1 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 34,
    "title": "Rotate an array by one position.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nRotate an array by one position.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "5 1 2 3 4"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "30 10 20"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "5 1 2 3 4"
      },
      {
        "input": "3\n10 20 30",
        "expectedOutput": "30 10 20"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 35,
    "title": "Rotate an array by K positions.",
    "category": "Array",
    "difficulty": "Beginner",
    "description": "### Problem Description\n\nRotate an array by K positions.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n2",
        "expectedOutput": "4 5 1 2 3"
      },
      {
        "input": "4\n1 2 3 4\n1",
        "expectedOutput": "4 1 2 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n2",
        "expectedOutput": "4 5 1 2 3"
      },
      {
        "input": "4\n1 2 3 4\n1",
        "expectedOutput": "4 1 2 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 36,
    "title": "Find the missing number from an array containing numbers from 1 to N.",
    "category": "Array",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the missing number from an array containing numbers from 1 to N.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "4\n1 2 4",
        "expectedOutput": "3"
      },
      {
        "input": "5\n1 2 3 5",
        "expectedOutput": "4"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "4\n1 2 4",
        "expectedOutput": "3"
      },
      {
        "input": "5\n1 2 3 5",
        "expectedOutput": "4"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 37,
    "title": "Find the duplicate element in an array.",
    "category": "Array",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the duplicate element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 2",
        "expectedOutput": "2"
      },
      {
        "input": "4\n1 1 2 3",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 2",
        "expectedOutput": "2"
      },
      {
        "input": "4\n1 1 2 3",
        "expectedOutput": "1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 38,
    "title": "Find common elements in two arrays.",
    "category": "Array",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind common elements in two arrays.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n3\n3 4 5",
        "expectedOutput": "3 4 5"
      },
      {
        "input": "3\n1 2 3\n2\n4 5",
        "expectedOutput": "None"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n3\n3 4 5",
        "expectedOutput": "3 4 5"
      },
      {
        "input": "3\n1 2 3\n2\n4 5",
        "expectedOutput": "None"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 39,
    "title": "Merge two sorted arrays.",
    "category": "Array",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nMerge two sorted arrays.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 3 5\n3\n2 4 6",
        "expectedOutput": "1 2 3 4 5 6"
      },
      {
        "input": "2\n1 2\n2\n3 4",
        "expectedOutput": "1 2 3 4"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 3 5\n3\n2 4 6",
        "expectedOutput": "1 2 3 4 5 6"
      },
      {
        "input": "2\n1 2\n2\n3 4",
        "expectedOutput": "1 2 3 4"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 40,
    "title": "Find the maximum subarray sum.",
    "category": "Array",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the maximum subarray sum.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n-2 1 -3 4 -1",
        "expectedOutput": "4"
      },
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "15"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n-2 1 -3 4 -1",
        "expectedOutput": "4"
      },
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "15"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 41,
    "title": "Find the length of a string without using a built-in length function.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the length of a string without using a built-in length function.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello",
        "expectedOutput": "5"
      },
      {
        "input": "world",
        "expectedOutput": "5"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello",
        "expectedOutput": "5"
      },
      {
        "input": "world",
        "expectedOutput": "5"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 42,
    "title": "Reverse a string.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nReverse a string.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello",
        "expectedOutput": "olleh"
      },
      {
        "input": "world",
        "expectedOutput": "dlrow"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello",
        "expectedOutput": "olleh"
      },
      {
        "input": "world",
        "expectedOutput": "dlrow"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 43,
    "title": "Check whether a string is a palindrome.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCheck whether a string is a palindrome.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "radar",
        "expectedOutput": "True"
      },
      {
        "input": "hello",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "radar",
        "expectedOutput": "True"
      },
      {
        "input": "hello",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 44,
    "title": "Count vowels and consonants in a string.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCount vowels and consonants in a string.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello",
        "expectedOutput": "2 3"
      },
      {
        "input": "world",
        "expectedOutput": "1 4"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello",
        "expectedOutput": "2 3"
      },
      {
        "input": "world",
        "expectedOutput": "1 4"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 45,
    "title": "Count uppercase and lowercase characters in a string.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCount uppercase and lowercase characters in a string.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "HeLLo",
        "expectedOutput": "2 3"
      },
      {
        "input": "WoRLD",
        "expectedOutput": "4 1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "HeLLo",
        "expectedOutput": "2 3"
      },
      {
        "input": "WoRLD",
        "expectedOutput": "4 1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 46,
    "title": "Count digits and special characters in a string.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCount digits and special characters in a string.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "a1@b2#",
        "expectedOutput": "2 2"
      },
      {
        "input": "h3llo!",
        "expectedOutput": "1 1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "a1@b2#",
        "expectedOutput": "2 2"
      },
      {
        "input": "h3llo!",
        "expectedOutput": "1 1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 47,
    "title": "Find the frequency of each character in a string.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the frequency of each character in a string.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello",
        "expectedOutput": "h:1 e:1 l:2 o:1"
      },
      {
        "input": "world",
        "expectedOutput": "w:1 o:1 r:1 l:1 d:1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello",
        "expectedOutput": "h:1 e:1 l:2 o:1"
      },
      {
        "input": "world",
        "expectedOutput": "w:1 o:1 r:1 l:1 d:1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 48,
    "title": "Remove spaces from a string.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nRemove spaces from a string.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello world",
        "expectedOutput": "helloworld"
      },
      {
        "input": "a b c",
        "expectedOutput": "abc"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello world",
        "expectedOutput": "helloworld"
      },
      {
        "input": "a b c",
        "expectedOutput": "abc"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 49,
    "title": "Remove duplicate characters from a string.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nRemove duplicate characters from a string.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello",
        "expectedOutput": "helo"
      },
      {
        "input": "world",
        "expectedOutput": "world"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello",
        "expectedOutput": "helo"
      },
      {
        "input": "world",
        "expectedOutput": "world"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 50,
    "title": "Find the first non-repeating character in a string.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the first non-repeating character in a string.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello",
        "expectedOutput": "h"
      },
      {
        "input": "swiss",
        "expectedOutput": "w"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello",
        "expectedOutput": "h"
      },
      {
        "input": "swiss",
        "expectedOutput": "w"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 51,
    "title": "Check whether two strings are anagrams.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCheck whether two strings are anagrams.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "listen silent",
        "expectedOutput": "True"
      },
      {
        "input": "hello world",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "listen silent",
        "expectedOutput": "True"
      },
      {
        "input": "hello world",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 52,
    "title": "Count the number of words in a sentence.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCount the number of words in a sentence.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello world",
        "expectedOutput": "2"
      },
      {
        "input": "a b c",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello world",
        "expectedOutput": "2"
      },
      {
        "input": "a b c",
        "expectedOutput": "3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 53,
    "title": "Reverse the words in a sentence.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nReverse the words in a sentence.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello world",
        "expectedOutput": "world hello"
      },
      {
        "input": "a b c",
        "expectedOutput": "c b a"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello world",
        "expectedOutput": "world hello"
      },
      {
        "input": "a b c",
        "expectedOutput": "c b a"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 54,
    "title": "Find the longest word in a sentence.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the longest word in a sentence.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello world",
        "expectedOutput": "hello"
      },
      {
        "input": "a quick brown fox",
        "expectedOutput": "quick"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello world",
        "expectedOutput": "hello"
      },
      {
        "input": "a quick brown fox",
        "expectedOutput": "quick"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 55,
    "title": "Check whether one string is a rotation of another.",
    "category": "String",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCheck whether one string is a rotation of another.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "waterbottle erbottlewat",
        "expectedOutput": "True"
      },
      {
        "input": "hello world",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "waterbottle erbottlewat",
        "expectedOutput": "True"
      },
      {
        "input": "hello world",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 56,
    "title": "Implement linear search.",
    "category": "Searching",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nImplement linear search.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n3",
        "expectedOutput": "2"
      },
      {
        "input": "5\n1 2 3 4 5\n6",
        "expectedOutput": "-1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n3",
        "expectedOutput": "2"
      },
      {
        "input": "5\n1 2 3 4 5\n6",
        "expectedOutput": "-1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 57,
    "title": "Implement binary search on a sorted array.",
    "category": "Searching",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nImplement binary search on a sorted array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n4",
        "expectedOutput": "3"
      },
      {
        "input": "5\n1 2 3 4 5\n6",
        "expectedOutput": "-1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n4",
        "expectedOutput": "3"
      },
      {
        "input": "5\n1 2 3 4 5\n6",
        "expectedOutput": "-1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 58,
    "title": "Find the first occurrence of an element in a sorted array.",
    "category": "Searching",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the first occurrence of an element in a sorted array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 2 2 3\n2",
        "expectedOutput": "1"
      },
      {
        "input": "4\n1 1 1 1\n1",
        "expectedOutput": "0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 2 2 3\n2",
        "expectedOutput": "1"
      },
      {
        "input": "4\n1 1 1 1\n1",
        "expectedOutput": "0"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 59,
    "title": "Find the last occurrence of an element in a sorted array.",
    "category": "Searching",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the last occurrence of an element in a sorted array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 2 2 3\n2",
        "expectedOutput": "3"
      },
      {
        "input": "4\n1 1 1 1\n1",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 2 2 3\n2",
        "expectedOutput": "3"
      },
      {
        "input": "4\n1 1 1 1\n1",
        "expectedOutput": "3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 60,
    "title": "Count the occurrences of a number in a sorted array.",
    "category": "Searching",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCount the occurrences of a number in a sorted array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 2 2 3\n2",
        "expectedOutput": "3"
      },
      {
        "input": "4\n1 1 1 1\n2",
        "expectedOutput": "0"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 2 2 3\n2",
        "expectedOutput": "3"
      },
      {
        "input": "4\n1 1 1 1\n2",
        "expectedOutput": "0"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 61,
    "title": "Implement bubble sort.",
    "category": "Sorting",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nImplement bubble sort.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "1 2 3 4 5"
      },
      {
        "input": "3\n3 1 2",
        "expectedOutput": "1 2 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "1 2 3 4 5"
      },
      {
        "input": "3\n3 1 2",
        "expectedOutput": "1 2 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 62,
    "title": "Implement selection sort.",
    "category": "Sorting",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nImplement selection sort.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "1 2 3 4 5"
      },
      {
        "input": "3\n3 1 2",
        "expectedOutput": "1 2 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "1 2 3 4 5"
      },
      {
        "input": "3\n3 1 2",
        "expectedOutput": "1 2 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 63,
    "title": "Implement insertion sort.",
    "category": "Sorting",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nImplement insertion sort.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "1 2 3 4 5"
      },
      {
        "input": "3\n3 1 2",
        "expectedOutput": "1 2 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "1 2 3 4 5"
      },
      {
        "input": "3\n3 1 2",
        "expectedOutput": "1 2 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 64,
    "title": "Check whether an array is already sorted.",
    "category": "Sorting",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCheck whether an array is already sorted.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "True"
      },
      {
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "True"
      },
      {
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 65,
    "title": "Sort an array of 0s, 1s, and 2s (Dutch National Flag problem).",
    "category": "Sorting",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nSort an array of 0s, 1s, and 2s (Dutch National Flag problem).\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "6\n0 1 2 0 1 2",
        "expectedOutput": "0 0 1 1 2 2"
      },
      {
        "input": "3\n2 0 1",
        "expectedOutput": "0 1 2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "6\n0 1 2 0 1 2",
        "expectedOutput": "0 0 1 1 2 2"
      },
      {
        "input": "3\n2 0 1",
        "expectedOutput": "0 1 2"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 66,
    "title": "Find the frequency of each element in an array.",
    "category": "Hashing",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the frequency of each element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 2 3 3",
        "expectedOutput": "1:1 2:2 3:2"
      },
      {
        "input": "3\n1 1 1",
        "expectedOutput": "1:3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 2 3 3",
        "expectedOutput": "1:1 2:2 3:2"
      },
      {
        "input": "3\n1 1 1",
        "expectedOutput": "1:3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 67,
    "title": "Find the first repeating element in an array.",
    "category": "Hashing",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind the first repeating element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 2 1",
        "expectedOutput": "1"
      },
      {
        "input": "4\n1 2 3 4",
        "expectedOutput": "None"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 2 1",
        "expectedOutput": "1"
      },
      {
        "input": "4\n1 2 3 4",
        "expectedOutput": "None"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 68,
    "title": "Find all non-repeating elements in an array.",
    "category": "Hashing",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind all non-repeating elements in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 2 3 4",
        "expectedOutput": "1 3 4"
      },
      {
        "input": "3\n1 1 1",
        "expectedOutput": "None"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 2 3 4",
        "expectedOutput": "1 3 4"
      },
      {
        "input": "3\n1 1 1",
        "expectedOutput": "None"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 69,
    "title": "Check whether two arrays are equal using frequency map.",
    "category": "Hashing",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nCheck whether two arrays are equal using frequency map.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3\n3\n3 2 1",
        "expectedOutput": "True"
      },
      {
        "input": "2\n1 2\n2\n2 3",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3\n3\n3 2 1",
        "expectedOutput": "True"
      },
      {
        "input": "2\n1 2\n2\n2 3",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 70,
    "title": "Find a pair of elements that sum up to a target value.",
    "category": "Hashing",
    "difficulty": "Intermediate",
    "description": "### Problem Description\n\nFind a pair of elements that sum up to a target value.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n9",
        "expectedOutput": "4 5"
      },
      {
        "input": "4\n1 2 3 4\n10",
        "expectedOutput": "None"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n9",
        "expectedOutput": "4 5"
      },
      {
        "input": "4\n1 2 3 4\n10",
        "expectedOutput": "None"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 71,
    "title": "Check whether a string is a palindrome using two pointers.",
    "category": "Two Pointers",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nCheck whether a string is a palindrome using two pointers.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "racecar",
        "expectedOutput": "True"
      },
      {
        "input": "hello",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "racecar",
        "expectedOutput": "True"
      },
      {
        "input": "hello",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 72,
    "title": "Reverse an array using two pointers.",
    "category": "Two Pointers",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nReverse an array using two pointers.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "5 4 3 2 1"
      },
      {
        "input": "4\n10 20 30 40",
        "expectedOutput": "40 30 20 10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "5 4 3 2 1"
      },
      {
        "input": "4\n10 20 30 40",
        "expectedOutput": "40 30 20 10"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 73,
    "title": "Move all negative numbers to the beginning of an array.",
    "category": "Two Pointers",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nMove all negative numbers to the beginning of an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n-1 2 -3 4 5",
        "expectedOutput": "-1 -3 2 4 5"
      },
      {
        "input": "3\n1 -2 3",
        "expectedOutput": "-2 1 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n-1 2 -3 4 5",
        "expectedOutput": "-1 -3 2 4 5"
      },
      {
        "input": "3\n1 -2 3",
        "expectedOutput": "-2 1 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 74,
    "title": "Remove duplicates from a sorted array using two pointers.",
    "category": "Two Pointers",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nRemove duplicates from a sorted array using two pointers.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 1 2 2 3",
        "expectedOutput": "1 2 3"
      },
      {
        "input": "3\n1 1 1",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 1 2 2 3",
        "expectedOutput": "1 2 3"
      },
      {
        "input": "3\n1 1 1",
        "expectedOutput": "1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 75,
    "title": "Find if a pair with a given sum exists in a sorted array.",
    "category": "Two Pointers",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nFind if a pair with a given sum exists in a sorted array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n7",
        "expectedOutput": "True"
      },
      {
        "input": "4\n1 2 3 4\n8",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n7",
        "expectedOutput": "True"
      },
      {
        "input": "4\n1 2 3 4\n8",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 76,
    "title": "Compute the prefix sum array of a given array.",
    "category": "Prefix Sum",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nCompute the prefix sum array of a given array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "1 3 6 10 15"
      },
      {
        "input": "3\n2 4 6",
        "expectedOutput": "2 6 12"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "1 3 6 10 15"
      },
      {
        "input": "3\n2 4 6",
        "expectedOutput": "2 6 12"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 77,
    "title": "Find the sum of elements in a range [L, R] using prefix sums.",
    "category": "Prefix Sum",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nFind the sum of elements in a range [L, R] using prefix sums.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n1 3",
        "expectedOutput": "9"
      },
      {
        "input": "4\n2 4 6 8\n0 2",
        "expectedOutput": "12"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n1 3",
        "expectedOutput": "9"
      },
      {
        "input": "4\n2 4 6 8\n0 2",
        "expectedOutput": "12"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 78,
    "title": "Find the equilibrium index of an array.",
    "category": "Prefix Sum",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nFind the equilibrium index of an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 3 5 2 2",
        "expectedOutput": "2"
      },
      {
        "input": "3\n1 2 3",
        "expectedOutput": "-1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 3 5 2 2",
        "expectedOutput": "2"
      },
      {
        "input": "3\n1 2 3",
        "expectedOutput": "-1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 79,
    "title": "Check if an array can be split into two parts with equal sum.",
    "category": "Prefix Sum",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nCheck if an array can be split into two parts with equal sum.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "4\n1 2 3 3",
        "expectedOutput": "True"
      },
      {
        "input": "4\n1 2 3 4",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "4\n1 2 3 3",
        "expectedOutput": "True"
      },
      {
        "input": "4\n1 2 3 4",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 80,
    "title": "Find the highest sum of a subarray of size K.",
    "category": "Prefix Sum",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nFind the highest sum of a subarray of size K.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n2",
        "expectedOutput": "9"
      },
      {
        "input": "4\n2 1 5 3\n3",
        "expectedOutput": "9"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n2",
        "expectedOutput": "9"
      },
      {
        "input": "4\n2 1 5 3\n3",
        "expectedOutput": "9"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 81,
    "title": "Create a singly linked list and print its elements.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nCreate a singly linked list and print its elements.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "1 -> 2 -> 3"
      },
      {
        "input": "2\n10 20",
        "expectedOutput": "10 -> 20"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "1 -> 2 -> 3"
      },
      {
        "input": "2\n10 20",
        "expectedOutput": "10 -> 20"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 82,
    "title": "Insert a node at the beginning of a linked list.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nInsert a node at the beginning of a linked list.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3\n0",
        "expectedOutput": "0 -> 1 -> 2 -> 3"
      },
      {
        "input": "2\n2 3\n1",
        "expectedOutput": "1 -> 2 -> 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3\n0",
        "expectedOutput": "0 -> 1 -> 2 -> 3"
      },
      {
        "input": "2\n2 3\n1",
        "expectedOutput": "1 -> 2 -> 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 83,
    "title": "Insert a node at the end of a linked list.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nInsert a node at the end of a linked list.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3\n4",
        "expectedOutput": "1 -> 2 -> 3 -> 4"
      },
      {
        "input": "2\n1 2\n3",
        "expectedOutput": "1 -> 2 -> 3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3\n4",
        "expectedOutput": "1 -> 2 -> 3 -> 4"
      },
      {
        "input": "2\n1 2\n3",
        "expectedOutput": "1 -> 2 -> 3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 84,
    "title": "Delete the first node of a linked list.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nDelete the first node of a linked list.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "2 -> 3"
      },
      {
        "input": "2\n1 2",
        "expectedOutput": "2"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "2 -> 3"
      },
      {
        "input": "2\n1 2",
        "expectedOutput": "2"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 85,
    "title": "Delete the last node of a linked list.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nDelete the last node of a linked list.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "1 -> 2"
      },
      {
        "input": "2\n1 2",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "1 -> 2"
      },
      {
        "input": "2\n1 2",
        "expectedOutput": "1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 86,
    "title": "Search for an element in a linked list.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nSearch for an element in a linked list.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3\n2",
        "expectedOutput": "True"
      },
      {
        "input": "3\n1 2 3\n5",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3\n2",
        "expectedOutput": "True"
      },
      {
        "input": "3\n1 2 3\n5",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 87,
    "title": "Find the length of a linked list.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nFind the length of a linked list.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "3"
      },
      {
        "input": "1\n10",
        "expectedOutput": "1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "3"
      },
      {
        "input": "1\n10",
        "expectedOutput": "1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 88,
    "title": "Reverse a singly linked list.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nReverse a singly linked list.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "3 -> 2 -> 1"
      },
      {
        "input": "2\n10 20",
        "expectedOutput": "20 -> 10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "3 -> 2 -> 1"
      },
      {
        "input": "2\n10 20",
        "expectedOutput": "20 -> 10"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 89,
    "title": "Find the middle element of a linked list.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nFind the middle element of a linked list.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "3"
      },
      {
        "input": "4\n1 2 3 4",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "3"
      },
      {
        "input": "4\n1 2 3 4",
        "expectedOutput": "3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 90,
    "title": "Check whether a linked list contains a cycle.",
    "category": "Linked List",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nCheck whether a linked list contains a cycle.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "False"
      },
      {
        "input": "1\n1",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3\n1 2 3",
        "expectedOutput": "False"
      },
      {
        "input": "1\n1",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 91,
    "title": "Implement a stack using an array.",
    "category": "Stack",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nImplement a stack using an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "push 1, push 2, pop",
        "expectedOutput": "2"
      },
      {
        "input": "push 5, pop",
        "expectedOutput": "5"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "push 1, push 2, pop",
        "expectedOutput": "2"
      },
      {
        "input": "push 5, pop",
        "expectedOutput": "5"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 92,
    "title": "Check for balanced parentheses in an expression.",
    "category": "Stack",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nCheck for balanced parentheses in an expression.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "{()}()",
        "expectedOutput": "True"
      },
      {
        "input": "{(})",
        "expectedOutput": "False"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "{()}()",
        "expectedOutput": "True"
      },
      {
        "input": "{(})",
        "expectedOutput": "False"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 93,
    "title": "Reverse a string using a stack.",
    "category": "Stack",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nReverse a string using a stack.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "hello",
        "expectedOutput": "olleh"
      },
      {
        "input": "code",
        "expectedOutput": "edoc"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "hello",
        "expectedOutput": "olleh"
      },
      {
        "input": "code",
        "expectedOutput": "edoc"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 94,
    "title": "Evaluate a postfix expression.",
    "category": "Stack",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nEvaluate a postfix expression.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "2 3 + 4 *",
        "expectedOutput": "20"
      },
      {
        "input": "5 2 -",
        "expectedOutput": "3"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "2 3 + 4 *",
        "expectedOutput": "20"
      },
      {
        "input": "5 2 -",
        "expectedOutput": "3"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 95,
    "title": "Find the next greater element for each element in an array.",
    "category": "Stack",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nFind the next greater element for each element in an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "4\n4 5 2 25",
        "expectedOutput": "5 25 25 -1"
      },
      {
        "input": "3\n1 3 2",
        "expectedOutput": "3 -1 -1"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "4\n4 5 2 25",
        "expectedOutput": "5 25 25 -1"
      },
      {
        "input": "3\n1 3 2",
        "expectedOutput": "3 -1 -1"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 96,
    "title": "Implement a queue using an array.",
    "category": "Queue",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nImplement a queue using an array.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "enqueue 1, enqueue 2, dequeue",
        "expectedOutput": "1"
      },
      {
        "input": "enqueue 5, dequeue",
        "expectedOutput": "5"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "enqueue 1, enqueue 2, dequeue",
        "expectedOutput": "1"
      },
      {
        "input": "enqueue 5, dequeue",
        "expectedOutput": "5"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 97,
    "title": "Implement a circular queue.",
    "category": "Queue",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nImplement a circular queue.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "enqueue 1, enqueue 2, dequeue, enqueue 3",
        "expectedOutput": "1"
      },
      {
        "input": "enqueue 10, dequeue",
        "expectedOutput": "10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "enqueue 1, enqueue 2, dequeue, enqueue 3",
        "expectedOutput": "1"
      },
      {
        "input": "enqueue 10, dequeue",
        "expectedOutput": "10"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 98,
    "title": "Generate binary numbers from 1 to N using a queue.",
    "category": "Queue",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nGenerate binary numbers from 1 to N using a queue.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "3",
        "expectedOutput": "1 10 11"
      },
      {
        "input": "5",
        "expectedOutput": "1 10 11 100 101"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "3",
        "expectedOutput": "1 10 11"
      },
      {
        "input": "5",
        "expectedOutput": "1 10 11 100 101"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 99,
    "title": "Reverse the first K elements of a queue.",
    "category": "Queue",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nReverse the first K elements of a queue.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "5\n1 2 3 4 5\n3",
        "expectedOutput": "3 2 1 4 5"
      },
      {
        "input": "4\n10 20 30 40\n2",
        "expectedOutput": "20 10 30 40"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "5\n1 2 3 4 5\n3",
        "expectedOutput": "3 2 1 4 5"
      },
      {
        "input": "4\n10 20 30 40\n2",
        "expectedOutput": "20 10 30 40"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  },
  {
    "questionId": 100,
    "title": "Implement a stack using queues.",
    "category": "Queue",
    "difficulty": "Advanced",
    "description": "### Problem Description\n\nImplement a stack using queues.\n\n### Input Format\nRead from standard input (stdin).\n\n### Output Format\nPrint output to standard output (stdout).\n\n### Constraints\n- Time Limit: 2.0s\n- Memory Limit: 256MB",
    "sampleTestCases": [
      {
        "input": "push 1, push 2, pop",
        "expectedOutput": "2"
      },
      {
        "input": "push 10, pop",
        "expectedOutput": "10"
      }
    ],
    "hiddenTestCases": [
      {
        "input": "push 1, push 2, pop",
        "expectedOutput": "2"
      },
      {
        "input": "push 10, pop",
        "expectedOutput": "10"
      }
    ],
    "starterCode": {
      "python": "# Read input from standard input\nimport sys\n\ndef main():\n    input_data = sys.stdin.read().strip()\n    if not input_data:\n        return\n    # Write your solution below\n\nif __name__ == \"__main__\":\n    main()\n",
      "javascript": "const fs = require(\"fs\");\n\nfunction main() {\n    const input = fs.readFileSync(0, \"utf-8\").trim();\n    if (!input) return;\n    // Write your solution below\n}\n\nmain();\n",
      "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Write your solution below\n    return 0;\n}\n",
      "java": "import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution below\n    }\n}\n"
    },
    "supportedLanguages": [
      "Python",
      "JavaScript",
      "Java",
      "C++"
    ],
    "isActive": true
  }
];

export default STATIC_QUESTIONS;
