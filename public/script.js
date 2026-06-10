const generateBtn = document.getElementById("generateBtn");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const evaluateBtn = document.getElementById("evaluateBtn");
const roleSelect = document.getElementById("role");
const difficultySelect = document.getElementById("difficulty");
const questionBox = document.getElementById("questionBox");
const answerInput = document.getElementById("answerInput");
const resultBox = document.getElementById("resultBox");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const historyBox = document.getElementById("historyBox");

const totalInterviews = document.getElementById("totalInterviews");
const averageScore = document.getElementById("averageScore");

async function generateQuestion() {
    const role = roleSelect.value;
    const difficulty = difficultySelect.value;

    questionBox.innerText = "Generating question...";
    resultBox.innerText = "Evaluation will appear here...";
    answerInput.value = "";

    try {
        const response = await fetch("/generate-question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ role, difficulty }),
        });

        const data = await response.json();

        if (data.success) {
            questionBox.innerText = data.question;
        } else {
            questionBox.innerText = data.message || "Could not generate question";
        }
    } catch (error) {
        questionBox.innerText = "Error generating question";
        console.error(error);
    }
}

generateBtn.addEventListener("click", generateQuestion);
nextQuestionBtn.addEventListener("click", generateQuestion);

evaluateBtn.addEventListener("click", async () => {
    const role = roleSelect.value;
    const difficulty = difficultySelect.value;
    const question = questionBox.innerText;
    const answer = answerInput.value;

    if (
        !question ||
        question === "Question will appear here..." ||
        question === "Generating question..." ||
        question.includes("Gemini quota exceeded")
    ) {
        resultBox.innerText = "Please generate a valid question first.";
        return;
    }

    if (!answer.trim()) {
        resultBox.innerText = "Please type your answer first.";
        return;
    }

    resultBox.innerText = "Evaluating answer...";

    try {
        const response = await fetch("/evaluate-answer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question, answer }),
        });

        const data = await response.json();

        if (!data.success) {
            resultBox.innerText = data.message || "Could not evaluate answer";
            return;
        }

        resultBox.innerHTML = `
            <h3>Score: ${data.score}/10</h3>

            <p><strong>Strengths:</strong></p>
            <ul>
                ${data.strengths.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <p><strong>Improvements:</strong></p>
            <ul>
                ${data.improvements.map(item => `<li>${item}</li>`).join("")}
            </ul>

            <p><strong>Sample Answer:</strong></p>
            <p>${data.sampleAnswer}</p>
        `;

        saveHistory(role, difficulty, question, answer, data.score);
    } catch (error) {
        resultBox.innerText = "Error evaluating answer";
        console.error(error);
    }
});

function saveHistory(role, difficulty, question, answer, score) {
    const history = JSON.parse(localStorage.getItem("interviewHistory")) || [];

    const item = {
        role,
        difficulty,
        question,
        answer,
        score,
        date: new Date().toLocaleString(),
    };

    history.unshift(item);
    localStorage.setItem("interviewHistory", JSON.stringify(history));

    displayHistory();
    updateStats();
}

function displayHistory() {
    const history = JSON.parse(localStorage.getItem("interviewHistory")) || [];

    if (history.length === 0) {
        historyBox.innerHTML = "No history yet.";
        updateStats();
        return;
    }

    historyBox.innerHTML = history.map(item => `
        <div class="history-item">
            <strong>Role:</strong> ${item.role}<br>
            <strong>Difficulty:</strong> ${item.difficulty || "Medium"}<br>
            <strong>Score:</strong> ${item.score}/10<br>
            <strong>Question:</strong> ${item.question}<br>
            <strong>Your Answer:</strong> ${item.answer}<br>
            <small>${item.date}</small>
        </div>
    `).join("");

    updateStats();
}

function updateStats() {
    const history = JSON.parse(localStorage.getItem("interviewHistory")) || [];

    totalInterviews.innerText = history.length;

    if (history.length === 0) {
        averageScore.innerText = "0";
        return;
    }

    const totalScore = history.reduce((sum, item) => {
        return sum + Number(item.score);
    }, 0);

    averageScore.innerText = (totalScore / history.length).toFixed(1);
}

clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("interviewHistory");
    displayHistory();
    updateStats();
});

displayHistory();
updateStats();