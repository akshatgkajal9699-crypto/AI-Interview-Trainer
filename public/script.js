const generateBtn = document.getElementById("generateBtn");
const evaluateBtn = document.getElementById("evaluateBtn");
const roleSelect = document.getElementById("role");
const questionBox = document.getElementById("questionBox");
const answerInput = document.getElementById("answerInput");
const resultBox = document.getElementById("resultBox");

generateBtn.addEventListener("click", async () => {
    const role = roleSelect.value;

    questionBox.innerText = "Generating question...";
    resultBox.innerText = "Evaluation will appear here...";
    answerInput.value = "";

    try {
        const response = await fetch("/generate-question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ role }),
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
});

evaluateBtn.addEventListener("click", async () => {
    const question = questionBox.innerText;
    const answer = answerInput.value;

    if (!question || question === "Question will appear here..." || question === "Generating question...") {
        resultBox.innerText = "Please generate a question first.";
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
    } catch (error) {
        resultBox.innerText = "Error evaluating answer";
        console.error(error);
    }
});