/* =========================================================
   AutoPost AI — Premium UI
   File: script.js
   ========================================================= */

"use strict";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const postForm = document.querySelector("#postForm");
const promptInput = document.querySelector("#prompt");
const platformSelect = document.querySelector("#platform");
const toneSelect = document.querySelector("#tone");
const generateButton = document.querySelector(".generate-button");

const loader = document.querySelector(".loader");

const previewContent = document.querySelector(".post-content p");
const previewPlatform = document.querySelector(".facebook-user strong");
const previewTime = document.querySelector(".facebook-user span");

const activityContainer = document.querySelector(".activity");


/* =========================================================
   SAFETY CHECK
   ========================================================= */

if (!postForm) {
    console.warn("AutoPost AI: #postForm was not found.");
}


/* =========================================================
   DEFAULT DATA
   ========================================================= */

const DEFAULT_POST = {
    text: "Your AI-generated Facebook post will appear here.",
    platform: "Facebook",
    time: "Just now"
};


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializePreview();

    setupLivePreview();

    setupForm();

});


/* =========================================================
   INITIALIZE PREVIEW
   ========================================================= */

function initializePreview() {

    if (previewContent) {
        previewContent.textContent = DEFAULT_POST.text;
    }

    if (previewPlatform) {
        previewPlatform.textContent = DEFAULT_POST.platform;
    }

    if (previewTime) {
        previewTime.textContent = DEFAULT_POST.time;
    }

}


/* =========================================================
   FORM SETUP
   ========================================================= */

function setupForm() {

    if (!postForm) {
        return;
    }

    postForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const prompt = promptInput?.value.trim() || "";
        const platform = platformSelect?.value || "Facebook";
        const tone = toneSelect?.value || "Professional";

        if (!prompt) {

            showMessage(
                "Please enter a topic or idea first.",
                "warning"
            );

            promptInput?.focus();

            return;
        }

        setLoading(true);

        try {

            const generatedPost = await generatePost({
                prompt,
                platform,
                tone
            });

            updatePreview(
                generatedPost,
                platform
            );

            addActivity(
                "✓",
                "AI post generated successfully"
            );

        } catch (error) {

            console.error(
                "AutoPost AI Error:",
                error
            );

            showMessage(
                "Something went wrong. Please try again.",
                "error"
            );

            addActivity(
                "!",
                "Post generation failed"
            );

        } finally {

            setLoading(false);

        }

    });

}


/* =========================================================
   LIVE PREVIEW
   ========================================================= */

function setupLivePreview() {

    if (!promptInput) {
        return;
    }

    promptInput.addEventListener(
        "input",
        debounce(() => {

            const text =
                promptInput.value.trim();

            if (!text) {

                if (previewContent) {
                    previewContent.textContent =
                        DEFAULT_POST.text;
                }

                return;
            }

            if (previewContent) {

                previewContent.textContent =
                    text;

            }

        }, 250)
    );

}


/* =========================================================
   GENERATE POST
   ========================================================= */

async function generatePost({
    prompt,
    platform,
    tone
}) {

    /*
       ------------------------------------------------------
       IMPORTANT

       This function currently creates a local demo post.

       Later, when your n8n / AI API backend is ready,
       replace this function with your API request.
       ------------------------------------------------------
    */

    await delay(900);

    const post = createDemoPost(
        prompt,
        platform,
        tone
    );

    return post;

}


/* =========================================================
   DEMO AI POST GENERATOR
   ========================================================= */

function createDemoPost(
    prompt,
    platform,
    tone
) {

    const cleanPrompt =
        capitalizeFirstLetter(prompt);

    let post = "";

    switch (tone.toLowerCase()) {

        case "professional":

            post =
                `${cleanPrompt}\n\n` +
                `Discover valuable insights and practical ideas ` +
                `that can help you move forward.\n\n` +
                `Stay consistent. Keep learning. Keep growing. 🚀`;

            break;


        case "friendly":

            post =
                `Hey everyone! 👋\n\n` +
                `${cleanPrompt}\n\n` +
                `What do you think? Share your thoughts below! 💬`;

            break;


        case "creative":

            post =
                `✨ ${cleanPrompt}\n\n` +
                `Sometimes one simple idea can create a big difference.\n\n` +
                `Think differently. Create boldly. 🚀`;

            break;


        case "emotional":

            post =
                `${cleanPrompt}\n\n` +
                `Every journey starts with one small step. ❤️\n\n` +
                `Keep believing in yourself and never stop moving forward.`;

            break;


        default:

            post =
                `${cleanPrompt}\n\n` +
                `Stay focused, stay consistent and keep growing. 🚀`;

    }

    return post;

}


/* =========================================================
   UPDATE FACEBOOK PREVIEW
   ========================================================= */

function updatePreview(
    postText,
    platform
) {

    if (previewContent) {

        previewContent.textContent =
            postText;

    }

    if (previewPlatform) {

        previewPlatform.textContent =
            platform;

    }

    if (previewTime) {

        previewTime.textContent =
            "Just now";

    }

}


/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoading(isLoading) {

    if (generateButton) {

        generateButton.disabled =
            isLoading;

        generateButton.style.opacity =
            isLoading ? "0.7" : "1";

        generateButton.style.cursor =
            isLoading ? "wait" : "pointer";

    }


    if (loader) {

        loader.classList.toggle(
            "active",
            isLoading
        );

    }

}


/* =========================================================
   ACTIVITY LOG
   ========================================================= */

function addActivity(
    icon,
    message
) {

    if (!activityContainer) {
        return;
    }

    const item =
        document.createElement("div");

    item.className =
        "activity-item";


    const iconElement =
        document.createElement("div");

    iconElement.className =
        "activity-icon";

    iconElement.textContent =
        icon;


    const messageElement =
        document.createElement("span");

    messageElement.textContent =
        message;


    const timeElement =
        document.createElement("span");

    timeElement.className =
        "activity-time";

    timeElement.textContent =
        "Just now";


    item.appendChild(
        iconElement
    );

    item.appendChild(
        messageElement
    );

    item.appendChild(
        timeElement
    );


    activityContainer.prepend(
        item
    );


    /*
       Keep only the latest 5 activities.
    */

    const activities =
        activityContainer.querySelectorAll(
            ".activity-item"
        );


    if (activities.length > 5) {

        activities[
            activities.length - 1
        ].remove();

    }

}


/* =========================================================
   MESSAGE SYSTEM
   ========================================================= */

function showMessage(
    message,
    type = "info"
) {

    const existing =
        document.querySelector(
            ".auto-message"
        );

    if (existing) {
        existing.remove();
    }


    const messageElement =
        document.createElement("div");

    messageElement.className =
        `auto-message ${type}`;

    messageElement.textContent =
        message;


    messageElement.style.cssText = `
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 12px;
        line-height: 1.5;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        color: #cbd5e1;
    `;


    if (postForm) {

        postForm.appendChild(
            messageElement
        );

    }


    setTimeout(() => {

        messageElement.remove();

    }, 3500);

}


/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(
    callback,
    wait = 250
) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(
            () => callback(...args),
            wait
        );

    };

}


/* =========================================================
   DELAY
   ========================================================= */

function delay(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


/* =========================================================
   CAPITALIZE
   ========================================================= */

function capitalizeFirstLetter(
    text
) {

    if (!text) {
        return "";
    }

    return text.charAt(0).toUpperCase() +
        text.slice(1);

}


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        /*
           Ctrl + Enter / Cmd + Enter
           generates the post.
        */

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            if (postForm) {

                postForm.requestSubmit();

            }

        }

    }
);


/* =========================================================
   EXPORT FOR DEBUGGING
   ========================================================= */

window.AutoPostAI = {

    generatePost,

    updatePreview,

    addActivity,

    setLoading

};


console.log(
    "AutoPost AI initialized successfully."
);