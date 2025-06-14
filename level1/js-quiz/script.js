"use strict"; // Enable strict mode for cleaner code

// 1. Data: Array of quiz questions
const quizQuestions = [
  {
    question: "What keyword is used to declare a variable that cannot be reassigned (for primitives)?",
    answer: "const"
  },
  {
    question: "Which JavaScript data type represents a true or false value?",
    answer: "boolean"
  },
  {
    question: "What is the result of the JavaScript expression: '5' + 3?",
    answer: "53" // Demonstrates string concatenation (type coercion)
  },
  {
    question: "Which loop is generally preferred for iterating over the *values* of an array?",
    answer: "for...of"
  },
  {
    question: "What does 'typeof null' return in JavaScript?",
    answer: "object" // The historical quirk!
  },
  {
    question: "Which strict equality operator (checks value AND type) should you generally prefer: == or ===?",
    answer: "==="
  },
  {
    question: "Which scope do 'let' and 'const' variables have?",
    answer: "block"
  },
  {
    question: "What keyword is used to stop a loop entirely?",
    answer: "break"
  },
  {
    question: "The 'finally' block in a try...catch statement always runs. True or False?",
    answer: "true"
  },
  {
    question: "Which operator provides a default value ONLY if the left-hand side is null or undefined (?? or ||)?",
    answer: "??"
  }
];

// Variable to keep track of the score, accessible globally within this script
let score = 0;

// Function to handle asking a question and getting user input
function askQuestion(questionObj) {
  // Use prompt() to get user input. The returned value is always a string or null (if cancelled).
  let userAnswer = prompt(questionObj.question);
  return userAnswer;
}

// Function to check if the user's answer is correct
function checkAnswer(correctAnswer, userAnswer) {
  // 3. Type Coercion & Conversion: Ensure userAnswer is not null before converting to lower case.
  // 4. Operators: Uses strict equality (===) and logical AND (&&)
  // Convert both to lowercase for case-insensitive comparison (user-friendly)
  if (userAnswer === null) { // If user clicked cancel
      return false; // Treat as incorrect/skipped
  }
  return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
}

// Main function to start and manage the quiz game
function startGame() {
  score = 0; // 1. Variables: Reset score for a new game

  alert("Welcome to the JavaScript Fundamentals Quiz! Let's begin.");

  // 6. Loops: Iterate through each question in the quizQuestions array
  for (let i = 0; i < quizQuestions.length; i++) {
    const currentQuestion = quizQuestions[i]; // 1. Variables (const), Accessing array element

    // 7. Functions: Call askQuestion to get user's answer
    let userAnswer = askQuestion(currentQuestion);

    // 11. Error Handling: Basic check for user cancellation
    if (userAnswer === null) { // User clicked "Cancel" on the prompt
      alert("Quiz cancelled! You can restart by clicking the button again.");
      console.log("Quiz cancelled by user.");
      return; // Exit the startGame function early
    }

    // 5. Conditionals: Check if the answer is correct
    if (checkAnswer(currentQuestion.answer, userAnswer)) {
      score++; // 4. Operators: Increment score
      alert(`Correct! Your current score: ${score} / ${i + 1}`); // 7. Functions: Using template literals
    } else {
      // 7. Functions: Using template literals to show feedback
      alert(`Incorrect. The correct answer was: "${currentQuestion.answer}". Your current score: ${score} / ${i + 1}`);
    }
  }

  // Game ends: Display final score and message
  let finalMessage;
  // 14. Ternary operator: Choose message based on score
  if (score === quizQuestions.length) {
      finalMessage = "Perfect score! You are a true JavaScript Fundamentals Master! 🎉";
  } else if (score >= quizQuestions.length / 2) {
      finalMessage = "Good effort! You're getting there. Keep practicing! 💪";
  } else {
      finalMessage = "You need more practice. Review Level 1 concepts! 📚";
  }

  alert(`Quiz finished!\nYour final score: ${score} out of ${quizQuestions.length}.\n${finalMessage}`);
  console.log(`Quiz ended. Final Score: ${score} / ${quizQuestions.length}`); // For developer's console
}

// --- Event Listener to Start the Quiz ---
// This is a basic DOM interaction, which is a Level 2 concept,
// but essential for making the quiz start via a button click rather than immediately on page load.
// It uses document.getElementById and addEventListener.
// For Level 1, you can just call startGame() directly if you want it to pop up immediately.
// For now, let's attach it to the button:
document.getElementById('startButton').addEventListener('click', startGame);

// Optional: You could also just call startGame() directly if you want the quiz to pop up
// as soon as the page loads, without a button.
// startGame();