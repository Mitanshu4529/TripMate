// =========================================================
// TripMate AI - Client Interaction & State Handling
// =========================================================

let currentThreadId = localStorage.getItem("travel_thread_id") || null;
let latestAnswerMarkdown = "";
let progressInterval = null;

function setPrompt(text) {
    const input = document.getElementById("userInput");
    input.value = text;
    input.focus();
    // Auto-scroll input into view
    input.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearInput() {
    const input = document.getElementById("userInput");
    input.value = "";
    input.focus();
}

function resetSearch() {
    clearInput();
    const resultSection = document.getElementById("resultSection");
    resultSection.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function startAgentProgressAnimation() {
    const progressSection = document.getElementById("agentProgressSection");
    const progressTitle = document.getElementById("progressTitle");
    const progressSubtitle = document.getElementById("progressSubtitle");

    const steps = [
        { id: "stepFlight", title: "Flight Agent Active", sub: "Resolving IATA codes & fetching live schedules..." },
        { id: "stepHotel", title: "Hotel Agent Active", sub: "Conducting real-time web search for best stays..." },
        { id: "stepItinerary", title: "Itinerary Agent Active", sub: "Formulating day-by-day sightseeing & timing..." },
        { id: "stepFinal", title: "Synthesizing Blueprint", sub: "Formatting final travel blueprint with budget..." }
    ];

    // Reset all step classes
    steps.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) el.className = "agent-card";
    });

    progressSection.classList.remove("hidden");
    
    let currentStepIndex = 0;

    function activateStep(index) {
        if (index >= steps.length) return;

        steps.forEach((s, idx) => {
            const el = document.getElementById(s.id);
            if (!el) return;

            if (idx < index) {
                el.className = "agent-card completed";
            } else if (idx === index) {
                el.className = "agent-card active";
                progressTitle.textContent = steps[idx].title;
                progressSubtitle.textContent = steps[idx].sub;
            } else {
                el.className = "agent-card";
            }
        });
    }

    activateStep(0);

    let stepTimer = 0;
    progressInterval = setInterval(() => {
        stepTimer++;
        if (stepTimer === 2) activateStep(1);
        if (stepTimer === 5) activateStep(2);
        if (stepTimer === 8) activateStep(3);
    }, 1000);
}

function stopAgentProgressAnimation() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    const progressSection = document.getElementById("agentProgressSection");
    if (progressSection) progressSection.classList.add("hidden");
}

function setLoading(isLoading) {
    const sendBtn = document.getElementById("sendBtn");
    const btnText = document.getElementById("btnText");
    const btnLoader = document.getElementById("btnLoader");

    sendBtn.disabled = isLoading;

    if (isLoading) {
        btnText.classList.add("hidden");
        btnLoader.classList.remove("hidden");
        startAgentProgressAnimation();
    } else {
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");
        stopAgentProgressAnimation();
    }
}

function showError(message) {
    const errorBox = document.getElementById("errorBox");
    errorBox.textContent = `⚠️ ${message}`;
    errorBox.classList.remove("hidden");
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideError() {
    const errorBox = document.getElementById("errorBox");
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
}

function showResult(answer, threadId) {
    latestAnswerMarkdown = answer;

    const resultSection = document.getElementById("resultSection");
    const resultBox = document.getElementById("resultBox");
    const threadInfo = document.getElementById("threadInfo");

    if (typeof marked !== "undefined") {
        resultBox.innerHTML = marked.parse(answer);
    } else {
        resultBox.innerText = answer;
    }

    if (threadInfo) {
        threadInfo.textContent = `Thread: ${threadId.substring(0, 16)}...`;
    }

    resultSection.classList.remove("hidden");

    setTimeout(() => {
        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 100);
}

async function sendMessage() {
    hideError();

    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) {
        showError("Please enter your travel query or select one of the suggested trips.");
        input.focus();
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/travel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                thread_id: currentThreadId
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to generate travel plan. Please check backend connection.");
        }

        currentThreadId = data.thread_id;
        localStorage.setItem("travel_thread_id", currentThreadId);

        showResult(data.data?.answer || data.answer, data.thread_id);

    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

function copyResult() {
    const resultBox = document.getElementById("resultBox");
    const text = resultBox ? resultBox.innerText : "";

    if (!text) {
        showError("No travel plan available to copy.");
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            const copyBtn = document.getElementById("copyBtn") || document.querySelector(".copy-btn");
            if (copyBtn) {
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = '<span>✅</span> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalHtml;
                }, 1800);
            }
        })
        .catch(() => {
            showError("Could not copy result to clipboard.");
        });
}

function downloadPDF() {
    const resultBox = document.getElementById("resultBox");

    if (!latestAnswerMarkdown || !resultBox || !resultBox.innerHTML) {
        showError("No travel plan available to export. Please generate a plan first.");
        return;
    }

    const downloadBtn = document.getElementById("downloadBtn") || document.querySelector(".download-btn");
    let originalHtml = "";
    if (downloadBtn) {
        originalHtml = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span>⏳</span> Exporting...';
        downloadBtn.disabled = true;
    }

    // Create a clean, beautifully styled printable element
    const printContainer = document.createElement("div");
    printContainer.style.padding = "24px";
    printContainer.style.backgroundColor = "#ffffff";
    printContainer.style.color = "#0f172a";
    printContainer.style.fontFamily = "Arial, Helvetica, sans-serif";
    printContainer.style.lineHeight = "1.6";

    // Header banner in the PDF
    const headerEl = document.createElement("div");
    headerEl.innerHTML = `
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
            <h1 style="color: #1e3a8a; margin: 0; font-size: 24px;">✈️ TripMate AI — Custom Travel Itinerary</h1>
            <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Generated on ${new Date().toLocaleDateString()} | Multi-Agent Autonomous Plan</p>
        </div>
    `;
    printContainer.appendChild(headerEl);

    // Body content clone
    const contentClone = document.createElement("div");
    contentClone.innerHTML = resultBox.innerHTML;

    // Apply clean print styling to child elements
    contentClone.querySelectorAll("h1, h2, h3").forEach(h => {
        h.style.color = "#1e3a8a";
        h.style.marginTop = "18px";
        h.style.marginBottom = "8px";
    });
    contentClone.querySelectorAll("p, li").forEach(p => {
        p.style.color = "#334155";
        p.style.fontSize = "14px";
    });
    contentClone.querySelectorAll("table").forEach(t => {
        t.style.width = "100%";
        t.style.borderCollapse = "collapse";
        t.style.margin = "12px 0";
    });
    contentClone.querySelectorAll("th, td").forEach(td => {
        td.style.border = "1px solid #cbd5e1";
        td.style.padding = "8px 10px";
        td.style.fontSize = "13px";
    });
    contentClone.querySelectorAll("th").forEach(th => {
        th.style.backgroundColor = "#f1f5f9";
        th.style.color = "#0f172a";
    });

    printContainer.appendChild(contentClone);

    if (typeof html2pdf !== "undefined") {
        const opt = {
            margin: [12, 12, 12, 12],
            filename: `TripMate-Itinerary-${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
            .set(opt)
            .from(printContainer)
            .save()
            .then(() => {
                if (downloadBtn) {
                    downloadBtn.innerHTML = originalHtml;
                    downloadBtn.disabled = false;
                }
            })
            .catch(err => {
                console.error("PDF generation failed:", err);
                if (downloadBtn) {
                    downloadBtn.innerHTML = originalHtml;
                    downloadBtn.disabled = false;
                }
                // Fallback to browser print
                window.print();
            });
    } else {
        // Fallback if html2pdf CDN is blocked
        if (downloadBtn) {
            downloadBtn.innerHTML = originalHtml;
            downloadBtn.disabled = false;
        }
        window.print();
    }
}

// Global Keyboard Shortcut: Ctrl + Enter / Cmd + Enter
document.addEventListener("keydown", function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        sendMessage();
    }
});