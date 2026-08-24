/* =========================================================
   AutoPost AI — Premium UI
   File: script.js
   ========================================================= */

"use strict";


/* =========================================================
   n8n WEBHOOK CONFIGURATION
   ========================================================= */

const N8N_WEBHOOK_URL =
    "http://localhost:5678/webhook-test/c6dc9966-1bf4-4176-a9b2-5c31b62f8b11";


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const postForm =
    document.querySelector("#postForm");

const promptInput =
    document.querySelector("#prompt");

const platformSelect =
    document.querySelector("#platform");

const toneSelect =
    document.querySelector("#tone");

const generateButton =
    document.querySelector(".generate-button");

const loader =
    document.querySelector(".loader");

const previewContent =
    document.querySelector(".post-content p");

const previewPlatform =
    document.querySelector(".facebook-user strong");

const previewTime =
    document.querySelector(".facebook-user span");

const activityContainer =
    document.querySelector(".activity");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePreview();

        setupForm();

        setupLivePreview();

    }
);


/* =========================================================
   INITIAL PREVIEW
   ========================================================= */

function initializePreview() {

    if (previewContent) {

        previewContent.textContent =
            "Your AI-generated post will appear here.";

    }


    if (previewPlatform) {

        previewPlatform.textContent =
            "Facebook";

    }


    if (previewTime) {

        previewTime.textContent =
            "Just now";

    }

}


/* =========================================================
   FORM SETUP
   ========================================================= */

function setupForm() {

    if (!postForm) {

        console.error(
            "AutoPost AI: #postForm was not found."
        );

        return;

    }


    postForm.addEventListener(
        "submit",
        handleFormSubmit
    );

}


/* =========================================================
   FORM SUBMIT
   ========================================================= */

async function handleFormSubmit(event) {

    event.preventDefault();


    const prompt =
        promptInput?.value.trim() || "";


    const platform =
        platformSelect?.value || "Facebook";


    const tone =
        toneSelect?.value || "Professional";


    /* -----------------------------------------
       CHECK PROMPT
       ----------------------------------------- */

    if (!prompt) {

        showMessage(
            "Please enter your post request first.",
            "warning"
        );

        if (promptInput) {

            promptInput.focus();

        }

        return;

    }


    /* -----------------------------------------
       CHECK WEBHOOK
       ----------------------------------------- */

    if (
        !N8N_WEBHOOK_URL ||
        N8N_WEBHOOK_URL.includes(
            "PASTE_YOUR"
        )
    ) {

        showMessage(
            "n8n Webhook URL is missing.",
            "error"
        );

        return;

    }


    /* -----------------------------------------
       START LOADING
       ----------------------------------------- */

    setLoading(true);


    try {

        addActivity(
            "→",
            "Sending request to AI..."
        );


        /* -----------------------------------------
           SEND TO n8n
           ----------------------------------------- */

        const result =
            await sendToN8N(
                prompt,
                platform,
                tone
            );


        console.log(
            "n8n Response:",
            result
        );


        /* -----------------------------------------
           VALIDATE RESPONSE
           ----------------------------------------- */

        if (!result) {

            throw new Error(
                "No response received from n8n."
            );

        }


        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "AI generation failed."
            );

        }


        /* -----------------------------------------
           GET POST
           ----------------------------------------- */

        const generatedPost =
            extractPost(result);


        if (!generatedPost) {

            throw new Error(
                "n8n response does not contain a post."
            );

        }


        /* -----------------------------------------
           UPDATE FACEBOOK PREVIEW
           ----------------------------------------- */

        updatePreview(
            generatedPost,
            result.platform || platform
        );


        /* -----------------------------------------
           ACTIVITY
           ----------------------------------------- */

        addActivity(
            "✓",
            "AI post generated successfully"
        );


        showMessage(
            "Post generated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "AutoPost AI Error:",
            error
        );


        showMessage(
            getFriendlyError(error),
            "error"
        );


        addActivity(
            "!",
            "Post generation failed"
        );


    } finally {

        setLoading(false);

    }

}


/* =========================================================
   SEND REQUEST TO n8n
   ========================================================= */

async function sendToN8N(
    prompt,
    platform,
    tone
) {

    const response =
        await fetch(
            N8N_WEBHOOK_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    prompt: prompt,

                    platform: platform,

                    tone: tone

                })
            }
        );


    /* -----------------------------------------
       HTTP ERROR
       ----------------------------------------- */

    if (!response.ok) {

        throw new Error(
            `n8n returned HTTP ${response.status}`
        );

    }


    /* -----------------------------------------
       RESPONSE TEXT
       ----------------------------------------- */

    const responseText =
        await response.text();


    if (!responseText) {

        throw new Error(
            "n8n returned an empty response."
        );

    }


    /* -----------------------------------------
       PARSE JSON
       ----------------------------------------- */

    try {

        return JSON.parse(
            responseText
        );

    } catch {

        /*
           If n8n returns plain text,
           use it as the post.
        */

        return {

            success: true,

            post: responseText,

            platform: platform

        };

    }

}


/* =========================================================
   EXTRACT POST
   ========================================================= */

function extractPost(data) {

    /* -----------------------------------------
       Direct response
       ----------------------------------------- */

    if (
        typeof data.post === "string" &&
        data.post.trim()
    ) {

        return data.post.trim();

    }


    /* -----------------------------------------
       AI output
       ----------------------------------------- */

    if (
        typeof data.output === "string" &&
        data.output.trim()
    ) {

        return data.output.trim();

    }


    /* -----------------------------------------
       Message response
       ----------------------------------------- */

    if (
        typeof data.message === "string" &&
        data.message.trim()
    ) {

        return data.message.trim();

    }


    /* -----------------------------------------
       Array response
       ----------------------------------------- */

    if (Array.isArray(data)) {

        for (
            const item of data
        ) {

            if (
                item &&
                typeof item.post === "string" &&
                item.post.trim()
            ) {

                return item.post.trim();

            }


            if (
                item &&
                typeof item.output === "string" &&
                item.output.trim()
            ) {

                return item.output.trim();

            }

        }

    }


    return "";

}


/* =========================================================
   UPDATE PREVIEW
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

function setLoading(
    isLoading
) {

    if (generateButton) {

        generateButton.disabled =
            isLoading;


        generateButton.style.opacity =
            isLoading
                ? "0.65"
                : "1";


        generateButton.style.cursor =
            isLoading
                ? "wait"
                : "pointer";


        if (isLoading) {

            generateButton.setAttribute(
                "aria-busy",
                "true"
            );

        } else {

            generateButton.removeAttribute(
                "aria-busy"
            );

        }

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
        document.createElement(
            "div"
        );

    item.className =
        "activity-item";


    const iconElement =
        document.createElement(
            "div"
        );

    iconElement.className =
        "activity-icon";

    iconElement.textContent =
        icon;


    const messageElement =
        document.createElement(
            "span"
        );

    messageElement.textContent =
        message;


    const timeElement =
        document.createElement(
            "span"
        );

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


    /* -----------------------------------------
       Keep latest 5 activities
       ----------------------------------------- */

    const items =
        activityContainer.querySelectorAll(
            ".activity-item"
        );


    if (items.length > 5) {

        items[
            items.length - 1
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

    const oldMessage =
        document.querySelector(
            ".auto-message"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const messageElement =
        document.createElement(
            "div"
        );


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


    if (type === "success") {

        messageElement.style.color =
            "#22c55e";

    }


    if (type === "error") {

        messageElement.style.color =
            "#ef4444";

    }


    if (type === "warning") {

        messageElement.style.color =
            "#f59e0b";

    }


    if (postForm) {

        postForm.appendChild(
            messageElement
        );

    }


    setTimeout(
        () => {

            if (
                messageElement &&
                messageElement.parentNode
            ) {

                messageElement.remove();

            }

        },
        4000
    );

}


/* =========================================================
   FRIENDLY ERROR
   ========================================================= */

function getFriendlyError(
    error
) {

    const message =
        error?.message || "";


    if (
        message.includes(
            "Failed to fetch"
        )
    ) {

        return (
            "Could not connect to n8n. " +
            "Make sure n8n is running and the Webhook is listening."
        );

    }


    if (
        message.includes(
            "ERR_CONNECTION_REFUSED"
        )
    ) {

        return (
            "n8n is not reachable. " +
            "Please start n8n and try again."
        );

    }


    if (
        message.includes(
            "HTTP 404"
        )
    ) {

        return (
            "Webhook was not found. " +
            "Check the n8n Webhook URL."
        );

    }


    if (
        message.includes(
            "HTTP 500"
        )
    ) {

        return (
            "n8n returned a server error. " +
            "Check your n8n workflow."
        );

    }


    return (
        message ||
        "Something went wrong. Please try again."
    );

}


/* =========================================================
   LIVE PREVIEW RESET
   ========================================================= */

function setupLivePreview() {

    if (!promptInput) {

        return;

    }


    promptInput.addEventListener(
        "input",
        () => {

            const text =
                promptInput.value.trim();


            /*
               Only show placeholder when
               the input is completely empty.
            */

            if (
                !text &&
                previewContent
            ) {

                previewContent.textContent =
                    "Your AI-generated post will appear here.";

            }

        }
    );

}


/* =========================================================
   KEYBOARD SHORTCUT
   Ctrl + Enter
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            (event.ctrlKey ||
             event.metaKey) &&
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
   GLOBAL API
   ========================================================= */

window.AutoPostAI = {

    sendToN8N,

    updatePreview,

    addActivity,

    setLoading

};


/* =========================================================
   READY MESSAGE
   ========================================================= */

console.log(
    "AutoPost AI frontend loaded successfully."
);

console.log(
    "n8n Webhook:",
    N8N_WEBHOOK_URL
);