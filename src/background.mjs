const API_KEY = "";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const URL = `${ENDPOINT}?key=${API_KEY}`;

// 1. create the context-menu once
chrome.runtime.onInstalled.addListener(() =>
    chrome.contextMenus.create({
        id: "defineSelection",
        title: "Define \"%s\"",
        contexts: ["selection"],
    })
);

// 2. handle the click, call Gemini, then send the result
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "defineSelection") return;

    const prompt = `You are a friendly British English teacher. Explain ${info.selectionText} in very easy British English (A1 level).
    1. One short sentence: the meaning (maximum 12 words).
    2. One short sentence: an everyday example (maximum 12 words).
    3. Use only common words. Avoid difficult grammar.
    4. No extra words before or after the two sentences — no greetings or exclamations.`;
    let answer = "";

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        answer = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Something is wrong!";

        chrome.tabs.sendMessage(tab.id, {
            type: "SHOW_MODAL",
            text: answer
        })
    } catch (error) {
        answer = 'Gemini error: ' + error.message;
    }
});
