
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-novely",
    title: "Salvar no Novely Peak",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(
  async (info, tab) => {
    if (info.menuItemId !== "save-to-novely") return;

    const USER_ID =
      "a3b84f2c-1234-5678-abcd-ef1234567890";

    const API_URL = `http://localhost:8080/api/users/${USER_ID}/links`;

    const payload = {
      title: tab?.title || "Página",
      url: info.pageUrl,
      categoryName: "Quick Save",
      notes: ["Salvo via clique direito"],
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const div = document.createElement("div");

            div.innerText =
              "✓ Salvo no Novely Peak";

            div.style.position = "fixed";
            div.style.top = "20px";
            div.style.right = "20px";
            div.style.padding = "12px 18px";
            div.style.background = "#111827";
            div.style.color = "white";
            div.style.borderRadius = "14px";
            div.style.zIndex = "999999";
            div.style.fontFamily = "sans-serif";
            div.style.boxShadow =
              "0 10px 40px rgba(0,0,0,.4)";

            document.body.appendChild(div);

            setTimeout(() => {
              div.remove();
            }, 2500);
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
);

