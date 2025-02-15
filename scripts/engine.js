import * as Api from "./api.js";

let Offline = true;
const Body = document.createElement("div");
Body.innerHTML = `
    <header>Territorial</header>
    <div style="
        display: flex;
        flex-direction: row;

        margin-top: 8px;
    ">
        <button class="Offline" style="background-color: rgb(0, 100, 0); width: 8em; border-right: none;">Offline</button>
        <button disabled class="Online" style="width: 8em;">Online</button>
    </div>

    <div style="
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    box-sizing: border-box;
    border: 1px solid rgb(255, 255, 255, 0.25);
    border-top: none;

    width: 13.325em;
    height: 3em;

    padding: 1em;
    ">
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;

            box-sizing: border-box;
            border: 1px solid rgba(255, 255, 255, 0.25);

            font-size: 14px;

            padding: 0;
            height: 2em;
            width: 100%;
        ">${JSON.parse(localStorage.getItem("User")).Username}</div>
        <button class="Start" style="
            display: flex;
            align-items: center;
            justify-content: center;

            padding: 0;
            width: 100%;
        ">Start</button>
    </div>
`;
Body.style.scale = "1.25";

const Prompt = new Api.Prompt({
    Title: "Territorial",
    Nodes: [Body]
}, [".Content", {
    left: "50%",
    top: "calc(50% + 2em)",
    transform: "translate(-50%, -30%)"
}]).Append();

Body.querySelector(".Online").addEventListener("click", () => {
    Offline = false;
    Body.querySelector(".Online").style.backgroundColor = "rgb(0, 100, 0)";
    Body.querySelector(".Offline").style.backgroundColor = "transparent";
});

Body.querySelector(".Offline").addEventListener("click", () => {
    Offline = true;
    Body.querySelector(".Offline").style.backgroundColor = "rgb(0, 100, 0)";
    Body.querySelector(".Online").style.backgroundColor = "transparent";
});

Body.querySelector(".Start").addEventListener("click", () => {
    Prompt.remove();
    Initialize();
});

const Initialize = () => {
    const PixelSize = window.GridSize;
    const FrameWidth = Api.Frame.offsetWidth;
    const FrameHeight = Api.Frame.offsetHeight;

    const PixelsX = Math.ceil(FrameWidth / PixelSize);
    const PixelsY = Math.ceil(FrameHeight / PixelSize);

    const Pixels = [];
    const PixelMap = new Map();
    const OwnedPixels = new Set();

    for (let PosX = 0; PosX < PixelsX; PosX++) {
        for (let PosY = 0; PosY < PixelsY; PosY++) {
            const Pixel = document.createElement("div");
            Pixel.style.position = "absolute";
            Pixel.style.left = `${PosX * PixelSize}px`;
            Pixel.style.top = `${PosY * PixelSize}px`;
            Pixel.style.width = `${PixelSize}px`;
            Pixel.style.height = `${PixelSize}px`;
            Pixel.setAttribute("Power", "1");

            Api.Frame.appendChild(Pixel);

            const Data = { X: PosX, Y: PosY, Element: Pixel, Owned: false, Color: null };
            Pixels.push(Data);
            PixelMap.set(`${PosX},${PosY}`, Data);
        }
    }

    const AssignOwner = (PixelData, Name) => {
        const Color = `rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)})`;
        PixelData.Element.style.backgroundColor = Color;
        PixelData.Element.innerHTML = `<span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)">${Name}</span>`;
        PixelData.Element.setAttribute("Owned", "");
        PixelData.Element.style.zIndex = "2";
        PixelData.Owned = true;
        PixelData.Color = Color;
        OwnedPixels.add(PixelData);
    };

    for (let Index = 0; Index < 1; Index++) {
        AssignOwner(Pixels[Math.floor(Math.random() * Pixels.length)], Api.GenerateNationName());
    }

    const Player = Pixels[Math.floor(Math.random() * Pixels.length)];
    AssignOwner(Player, JSON.parse(localStorage.getItem("User")).Username);
    Player.Element.setAttribute("Player", "");
    Player.Element.style.boxShadow = "0 0 2em 1em rgba(255, 255, 255, 0.25)";

    const Update = () => {
        const NewOwners = [];

        OwnedPixels.forEach(PixelData => {
            const Power = parseInt(PixelData.Element.getAttribute("Power")) + 2;
            PixelData.Element.setAttribute("Power", Power);

            if (PixelData.Element.hasAttribute("Player")) return;

            const Radius = Math.floor((Power / 2) / window.GridSize);

            for (let Dx = -Radius; Dx <= Radius; Dx++) {
                for (let Dy = -Radius + Math.abs(Dx); Dy <= Radius - Math.abs(Dx); Dy++) {
                    const Neighbor = PixelMap.get(`${PixelData.X + Dx},${PixelData.Y + Dy}`);
                    if (!Neighbor || Neighbor.Owned) continue;
                    NewOwners.push(Neighbor);
                    Neighbor.Owned = true;
                    Neighbor.Color = PixelData.Color;
                }
            }
        });

        NewOwners.forEach(PixelData => {
            PixelData.Element.setAttribute("Owned", "");
            PixelData.Element.style.backgroundColor = PixelData.Color;
            PixelData.Element.style.filter = "brightness(1.5)";
            OwnedPixels.add(PixelData);
        });

        OwnedPixels.forEach(PixelData => {
            const Neighbors = [
                PixelMap.get(`${PixelData.X - 1},${PixelData.Y}`),
                PixelMap.get(`${PixelData.X + 1},${PixelData.Y}`),
                PixelMap.get(`${PixelData.X},${PixelData.Y - 1}`),
                PixelMap.get(`${PixelData.X},${PixelData.Y + 1}`)
            ];

            const IsBorder = Neighbors.some(Neighbor => !Neighbor || !Neighbor.Owned);
            PixelData.Element.style.filter = IsBorder ? "brightness(1.5)" : "";
        });

        setTimeout(Update, 125);
    };

    Update();
};