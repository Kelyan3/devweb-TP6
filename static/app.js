const originURL = window.location.origin + "/";

document.getElementById("shorten-form").addEventListener("submit", async function(ev) {
    ev.preventDefault();
    const url = document.getElementById("url").value;
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    try {
        const response = await fetch(originURL + "api-v2/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ url })
        });
        const data = await response.json();

        if (!response.ok) {
            resultDiv.innerHTML = `<p class="has-text-danger"><strong>Erreur :</strong> ${data.error || "Erreur inconnue"}</p>`;
        } else {
            const shortUrl = data.short_url;
            const secretKey = data.secretKey;

            resultDiv.innerHTML = `
                <p><strong>Lien raccourci :</strong> <a class="has-text-info" href="${originURL}api-v2/${shortUrl}" target="_blank">${originURL}api-v2/${shortUrl}</a></p>
                <p><strong>Clé secrète pour effacer le lien :</strong> <span class="tag is-warning is-light">${secretKey}</span></p>
                <button class="button is-info" id="copy-btn">Copier l'URL</button>
                <div style="margin-top:1em;">
                    <input class="input" type="text" id="secret-key" placeholder="Clé secrète pour suppression" value="${secretKey}" style="max-width:200px;display:inline-block;" />
                    <button class="button is-danger" id="delete-btn">Supprimer le lien</button>
                </div>
                <div id="delete-result" style="margin-top:0.5em;"></div>
            `;
            document.getElementById("copy-btn").addEventListener("click", () => {
                navigator.clipboard.writeText(`http://localhost:8080/api-v2/${shortUrl}`);
            });
            document.getElementById("delete-btn").addEventListener("click", async () => {
                const apiKey = document.getElementById("secret-key").value;
                const urlPart = shortUrl.split("/").pop();
                const delResult = document.getElementById("delete-result");
                try {
                    const delResponse = await fetch(originURL + "api-v2/" + urlPart, {
                        method: "DELETE",
                        headers: {
                            "Accept": "application/json",
                            "X-API-KEY": apiKey
                        }
                    });
                    const delData = await delResponse.json();
                    if (delResponse.ok) {
                        delResult.innerHTML = `<p class="has-text-success"><strong>${delData.message}</strong></p>`;
                    } else {
                        delResult.innerHTML = `<p class="has-text-danger"><strong>Erreur :</strong> ${delData.error || "Erreur inconnue"}</p>`;
                    }
                } catch (error) {
                    delResult.innerHTML = `<p class="has-text-danger"><strong>Erreur :</strong> ${error.message}</p>`;
                }
            });
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="has-text-danger"><strong>Erreur :</strong> ${error.message}</p>`;
    }
});
