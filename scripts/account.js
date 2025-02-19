import * as Api from "./api.js";

const Storage = new Api.Storage("Users");
Api.UsernameLabel.addEventListener("click", async () => {
    const UsernameInput = document.createElement("input");
    UsernameInput.placeholder = "Username";
    UsernameInput.type = "text";

    const PasswordInput = document.createElement("input");
    PasswordInput.placeholder = "Password";
    PasswordInput.type = "text";

    const Submit = document.createElement("button");
    Submit.textContent = "Submit";

    const LogOut = document.createElement("button");
    LogOut.textContent = "Log Out";
    LogOut.style.backgroundColor = "rgb(200, 0, 0)";
    LogOut.style.display = localStorage.getItem("User") ? "" : "none";

    new Api.Prompt({
        Title: "Account",
        Nodes: [UsernameInput, PasswordInput, Submit, LogOut]
    }, [".Content", {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",

        justifyContent: "center",

        margin: "0",

        width: "calc(100% - 2em)",
        height: "calc(100% - 2em)"
    }]).Append();

    LogOut.addEventListener("click", () => {
        localStorage.removeItem("User");
        location.reload();
    });

    Submit.addEventListener("click", async () => {
        const Username = UsernameInput.value.trim();
        const Password = PasswordInput.value.trim();
        if (!Username || !Password) return;

        const User = { Username, Password };

        const Documents = await Storage.GetDocumentsByField("Username", User.Username);
        if (Documents.length > 0) {
            if (Documents[0].Password === Password) {
                localStorage.setItem("User", JSON.stringify(User));
                location.reload();
            }
        } else {
            await Storage.AppendDocument(User);
            localStorage.setItem("User", JSON.stringify(User));
            location.reload();
        }
    });
});

(async () => {
    if (localStorage.getItem("User")) {
        const ParsedUser = JSON.parse(localStorage.getItem("User"));
        const Documents = await Storage.GetDocumentsByField("Username", ParsedUser.Username);

        if (Documents.length > 0) {
            Api.UsernameLabel.textContent = Documents[0].Username;
        } else {
            localStorage.removeItem("User");
            location.reload();
        }
    } else {
        Api.UsernameLabel.textContent = "Log In";
    }
})();