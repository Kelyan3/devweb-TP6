const originURL = "http://localhost:8080/";

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
            resultDiv.innerHTML = `
                <p><strong>Lien raccourci :</strong> <a class="has-text-info" href="http://localhost:8080/api-v2/${data.short_url}" target="_blank">http://localhost:8080/api-v2/${data.short_url}</a></p>
                <button class="button is-info" id="copy-btn">Copier l'URL</button>
            `;
            document.getElementById("copy-btn").addEventListener("click", () => {
                navigator.clipboard.writeText(`http://localhost:8080/api-v2/${data.short_url}`);
            });
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="has-text-danger"><strong>Erreur :</strong> ${error.message}</p>`;
    }
});
