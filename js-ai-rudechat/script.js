//  Importo la chiave di OpenRouter dal file javascript esterno
import { API_KEY } from "./apikey.js";

// console.log(API_KEY);

// Inserimento messaggi finta chat nella pagina all'avvio
// const messages = [
//     // Messaggi "placeholder" iniziali
//     {
//         type: "sent",
//         text: "Ciao, come va?",
//         time: "01/11/2026, 20:30:45",
//     },
//     {
//         type: "received",
//         text: "Tutto bene, e tu?",
//         time: "01/11/2026, 20:31:30",
//     },
// ];

const messages = [];


// Preparazione blocco html messaggio da inserire nella pagina
function htmlMessages(message) {
    const type = message.type;
    const text = message.text;
    const time = message.time;

    if (type == "sent") {
        return `
        <div class="chat-message ${type} d-flex justify-content-end ps-12">
            <div class="p-4 d-flex flex-column gap-3 rounded-top-9 rounded-start-9 position-relative">
                <p class="m-0">${text}</p>
                <time class="align-self-end" datetime="${time}">${time}</time>
                <!-- <div class="triangle position-absolute bottom-0 end-0"></div> -->
                <div class="triangle-svg position-absolute bottom-0 end-0">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M -25 0 L 85 85 L 0 85 Z" stroke="currentColor" stroke-width="30" stroke-linejoin="round" fill="currentColor" />
                    </svg>
                </div>
            </div>
        </div>
        `;
    } else {
        return `
        <div class="chat-message ${type} d-flex justify-content-start pe-12">
            <div class="p-4 d-flex flex-column gap-3 rounded-top-9 rounded-end-9 position-relative">
                <p class="m-0">${text}</p>
                <time class="align-self-start" datetime="${time}">${time}</time>
                <!-- <div class="triangle position-absolute bottom-0 start-0"></div> -->
                <div class="triangle-svg position-absolute bottom-0 start-0">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 15 85 L 125 0 L 125 85 Z" stroke="currentColor" stroke-width="30" stroke-linejoin="round" fill="currentColor" />
                    </svg>
                </div>
            </div>
        </div>
        `;
    }
}

// Leggo l'array degli oggetti dei messaggi e li inserisco in pagina
function loadMessages() {
    // const chatContainer = document.querySelector(".chat-container");
    const chatContainer = document.querySelector(".chat-messages");
    let chatMessages = "";
    for (const message of messages) {
        // console.log(message);
        chatMessages += htmlMessages(message);
    }

    // Aggiungo al div .chat-messages tutti i div creati con i messaggi letti da messages
    chatContainer.innerHTML = chatMessages;

    // Scrollo alla fine del div .chat-messages all'aggiunta di tutti i messaggi
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

loadMessages();

function openRouterMessage() {
    const openRouterChat = [
        {
            role: "system",
            content: "Sei una persona scontrosa, dai modi rudi e poco accomodanti, e che considera tutti solo come degli inutili scocciatori. Rispondi in italiano, in modo conciso, breve e decisamente poco amichevole.",
        },
    ];

    for (const message of messages) {
        const chatPerOpenRouter = {
            content: message.text,
        };

        if (message.type == "sent") {
            chatPerOpenRouter.role = "user";
        } else {
            chatPerOpenRouter.role = "assistant";
        }

        openRouterChat.push(chatPerOpenRouter);
    }

    return openRouterChat;
}

function sendToOpenRouter() {
    const openRouterApi = "https://openrouter.ai/api/v1/chat/completions";
    const openRouterConfig = {
        method: "POST",
        headers: {
            // API_KEY di OpenRouter
            Authorization: `Bearer ${API_KEY}`,
            // 'HTTP-Referer': '<YOUR_SITE_URL>',
            // 'X-Title': '<YOUR_SITE_NAME>',
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            // model: "openai/gpt-4o-mini", // funziona ma consuma crediti
            model: "openrouter/free", // funziona e sembra essere veramente free
            messages: openRouterMessage(),
        }),
    };

    fetch(openRouterApi, openRouterConfig)
        .then((response) => {
            console.log("Response status:", response.status);

            return response.json();
        })
        .then((data) => {
            console.log(data);

            const modelTextMessage = data.choices[0].message.content;

            aggiungiMessaggioAllaChat(modelTextMessage, "received");
        });
}

// INPUT CHAT (form)
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    // console.log("Ho cliccato");
    const inputMessage = document.querySelector(".input-message");
    e.preventDefault();

    // testo messaggio digitato
    const textMessage = inputMessage.value.trim();

    if (!textMessage) {
        console.log("Errore! Devi scrivere un messaggio!");
        inputMessage.focus();
        return;
    } else {
        console.log("Messaggio:", textMessage);
    }

    aggiungiMessaggioAllaChat(textMessage, "sent");

    // Svuoto l'input della chat
    inputMessage.value = "";

    // Imposto il focus sull'imput della chat, in modo da rimanere in modalità scrittura dentro l'input dopo aver premuto iinvio o cliccato sul bottone di invio
    inputMessage.focus();

    sendToOpenRouter();
});

function aggiungiMessaggioAllaChat(textMessage, type) {
    // time options
    const optionsTime = {
        // weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };

    const time = new Date().toLocaleString("it-IT", { optionsTime });

    const message = {
        type,
        text: textMessage,
        time,
    };

    // Aggiungo l'oggetto messaggio all'array di oggetti globale messages
    messages.push(message);

    // Ricarico tutti i messaggi dall'array messages
    loadMessages();
}
