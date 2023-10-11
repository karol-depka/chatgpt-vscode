// @ts-ignore 

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  let response = '';

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "addResponse": {
        response = message.value;
        setResponse();
        break;
      }
      case "clearResponse": {
        response = '';
        break;
      }
      case "setPrompt": {
        document.getElementById("prompt-input").value = message.value;
        break;
      }
    }
  });

  function fixCodeBlocks(response) {
    const REGEX_CODEBLOCK = new RegExp('\`\`\`', 'g');
    const matches = response.match(REGEX_CODEBLOCK);

    const count = matches ? matches.length : 0;
    if (count % 2 === 0) {
      return response;
    } else {
      return response.concat('\n\`\`\`');
    }
  }

  function setResponse() {
    var converter = new showdown.Converter({
      omitExtraWLInCodeBlocks: true, 
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      literalMidWordUnderscores: true,
      simpleLineBreaks: true
    });
    response = fixCodeBlocks(response);
    html = converter.makeHtml(response);
    document.getElementById("response").innerHTML = html;

    var preCodeBlocks = document.querySelectorAll("pre code");
    for (var i = 0; i < preCodeBlocks.length; i++) {
        preCodeBlocks[i].classList.add(
          "p-2",
          "my-2",
          "block",
          "overflow-x-scroll"
        );

        var btn = document.createElement("button");
        btn.textContent = "Copy Code";

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            vscode.postMessage({
                type: 'codeSelected',
                value: preCodeBlocks[i].innerText
            });
        });

        preCodeBlocks[i].parentNode.insertBefore(btn, preCodeBlocks[i]);        
    }

    var codeBlocks = document.querySelectorAll('code');
    for (var i = 0; i < codeBlocks.length; i++) {
        if (codeBlocks[i].innerText.startsWith("Copy code")) {
            codeBlocks[i].innerText = codeBlocks[i].innerText.replace("Copy code", "");
        }

        codeBlocks[i].classList.add("inline-flex", "max-w-full", "overflow-hidden", "rounded-sm", "cursor-pointer");

        codeBlocks[i].addEventListener('click', function (e) {
            e.preventDefault();
            vscode.postMessage({
                type: 'codeSelected',
                value: 'ZZZZ' + this.innerText
            });
        });

        const d = document.createElement('div');
        d.innerHTML = codeBlocks[i].innerHTML;
        codeBlocks[i].innerHTML = null;
        codeBlocks[i].appendChild(d);
        d.classList.add("code");
    }

    microlight.reset('code');

    // Create an "Apply" button after the response is set
    var applyButton = document.createElement("button");
    applyButton.textContent = "Apply";
    applyButton.addEventListener('click', function (e) {
        e.preventDefault();
        vscode.postMessage({
            type: 'apply',
        });
    });
    // Append the "Apply" button to the response element
    document.getElementById("response").appendChild(applyButton);
  }

  document.getElementById('prompt-input').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
      vscode.postMessage({
        type: 'prompt',
        value: this.value
      });
    }
  });
})();