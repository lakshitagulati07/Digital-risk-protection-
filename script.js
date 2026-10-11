"use strict";

function showResult(element, type, message) {
    element.className = `result-box result-${type}`;
    element.textContent = message;
    element.style.display = "block";
}

function normalizeUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        return new URL(withProtocol);
    } catch {
        return null;
    }
}

function checkBrandImpersonation() {
    const input = document.getElementById("brandUrl").value.trim();
    const resultBox = document.getElementById("brandResult");

    if (!input) {
        showResult(resultBox, "warning", "⚠️ Please enter a website URL.");
        return;
    }

    const parsed = normalizeUrl(input);
    if (!parsed || !parsed.hostname.includes(".")) {
        showResult(resultBox, "warning", "⚠️ Please enter a valid website address, such as example.com.");
        return;
    }

    const host = parsed.hostname.toLowerCase();
    let risk = 0;
    const reasons = [];
    const lookalikePatterns = ["paypa1", "paypai", "amaz0n", "faceb00k", "g00gle", "micros0ft", "app1e"];

    if (parsed.protocol === "http:") {
        risk += 25;
        reasons.push("Uses HTTP rather than HTTPS");
    }
    if (/\d/.test(host)) {
        risk += 15;
        reasons.push("Domain contains numbers");
    }
    if (lookalikePatterns.some(pattern => host.includes(pattern))) {
        risk += 55;
        reasons.push("Possible brand lookalike spelling");
    }
    if ((host.match(/-/g) || []).length >= 2) {
        risk += 15;
        reasons.push("Domain contains multiple hyphens");
    }
    if (host.split(".").some(label => label.length > 30)) {
        risk += 10;
        reasons.push("Unusually long domain label");
    }

    if (risk >= 50) {
        showResult(resultBox, "danger", `🚨 High warning score (${Math.min(risk, 100)}%). ${reasons.join(". ")}. Avoid entering personal information until you verify the domain.`);
    } else if (risk >= 25) {
        showResult(resultBox, "warning", `⚠️ Some warning signs were found (${risk}%). ${reasons.join(". ")}. Verify the website through an official source.`);
    } else {
        showResult(resultBox, "safe", "✅ No obvious warning signs were detected by this basic demo. This does not guarantee that the website is safe.");
    }
}

function checkPhishing() {
    const input = document.getElementById("phishUrl").value.trim();
    const resultBox = document.getElementById("phishResult");

    if (!input) {
        showResult(resultBox, "warning", "⚠️ Please enter a link.");
        return;
    }

    const parsed = normalizeUrl(input);
    if (!parsed) {
        showResult(resultBox, "warning", "⚠️ This link could not be parsed. Check the address and try again.");
        return;
    }

    const fullUrl = `${parsed.hostname}${parsed.pathname}${parsed.search}`.toLowerCase();
    const phishingWords = ["login", "verify", "secure", "account", "update", "confirm", "banking", "password", "gift", "reset"];
    let score = 0;
    const reasons = [];

    if (parsed.protocol === "http:") {
        score += 25;
        reasons.push("uses HTTP");
    }
    if (phishingWords.some(word => fullUrl.includes(word))) {
        score += 25;
        reasons.push("contains words often seen in phishing lures");
    }
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname)) {
        score += 40;
        reasons.push("uses an IP address instead of a typical domain name");
    }
    if (input.length > 100) {
        score += 15;
        reasons.push("is unusually long");
    }
    if (parsed.hostname.includes("xn--")) {
        score += 25;
        reasons.push("contains an internationalized domain encoding");
    }
    if (parsed.hostname.split(".").length > 4) {
        score += 15;
        reasons.push("has an unusually deep subdomain structure");
    }

    score = Math.min(score, 100);
    if (score >= 50) {
        showResult(resultBox, "danger", `🚨 High warning score (${score}%). This link ${reasons.join(", ")}. Do not open it unless you can verify it independently.`);
    } else if (score >= 25) {
        showResult(resultBox, "warning", `⚠️ Caution (${score}%). This link ${reasons.join(", ")}. Check the sender and official domain before proceeding.`);
    } else {
        showResult(resultBox, "safe", "✅ No strong phishing indicators were found by this basic demo. Treat unexpected links cautiously even when the score is low.");
    }
}

function checkDataLeak() {
    const email = document.getElementById("leakEmail").value.trim();
    const resultBox = document.getElementById("leakResult");
    const progressDiv = document.getElementById("leakProgress");
    const progressBar = document.getElementById("progressBar");
    const percentText = document.getElementById("leakPercentText");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showResult(resultBox, "warning", "⚠️ Please enter a valid email address.");
        progressDiv.hidden = true;
        return;
    }

    // Demo-only score: this is intentionally not a real breach lookup.
    let risk = 20;
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.length < 12) risk += 10;
    if (/\d{4}/.test(lowerEmail)) risk += 10;
    if (lowerEmail.startsWith("admin") || lowerEmail.startsWith("info")) risk += 10;
    if (/(.)\1{3,}/.test(lowerEmail.split("@")[0])) risk += 10;
    risk = Math.min(risk, 60);

    let level = "Low";
    let type = "safe";
    let color = "#16a34a";
    if (risk >= 50) {
        level = "Higher";
        type = "danger";
        color = "#dc2626";
    } else if (risk >= 35) {
        level = "Moderate";
        type = "warning";
        color = "#d97706";
    }

    showResult(resultBox, type, `${level} demo risk score: ${risk}%. This is based on simple format heuristics only; it does not indicate whether this email appears in a data breach.`);
    progressDiv.hidden = false;
    progressBar.style.width = `${risk}%`;
    progressBar.style.backgroundColor = color;
    percentText.textContent = `Demo risk score: ${risk}%`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("brandButton").addEventListener("click", checkBrandImpersonation);
    document.getElementById("phishButton").addEventListener("click", checkPhishing);
    document.getElementById("leakButton").addEventListener("click", checkDataLeak);

    document.getElementById("brandUrl").addEventListener("keydown", event => {
        if (event.key === "Enter") checkBrandImpersonation();
    });
    document.getElementById("phishUrl").addEventListener("keydown", event => {
        if (event.key === "Enter") checkPhishing();
    });
    document.getElementById("leakEmail").addEventListener("keydown", event => {
        if (event.key === "Enter") checkDataLeak();
    });
});
