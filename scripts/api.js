import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import * as Firestore from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

window.GridSize = 8;

const FirebaseConfig = {
    apiKey: "AIzaSyCKjD2UJ2a9xE9cqxmxSCH_tY5BAeu9sss",
    authDomain: "terratorial-51218.firebaseapp.com",
    projectId: "terratorial-51218",
    storageBucket: "terratorial-51218.firebasestorage.app",
    messagingSenderId: "892636845919",
    appId: "1:892636845919:web:d4b028b5d96a0648ee88ea",
    measurementId: "G-DGT9ST4LWE"
}

export const App = initializeApp(FirebaseConfig);
export const Analytics = getAnalytics(App);
export const Db = Firestore.getFirestore(App);

export const Frame = document.querySelector(".Frame");

export const UsernameLabel = document.querySelector(".UsernameLabel");

export class Storage {
    constructor(Collection = "") {
        this.Collection = Collection;
    }

    async AppendDocument(DocumentData) {
        if (!this.Collection) return;
        const DocRef = await Firestore.addDoc(Firestore.collection(Db, this.Collection), DocumentData);
        return DocRef.id;
    }

    async GetDocument(DocumentId) {
        if (!this.Collection) return;
        const DocRef = Firestore.doc(Db, this.Collection, DocumentId);
        const Snapshot = await Firestore.getDoc(DocRef);

        if (Snapshot.exists()) {
            const data = Snapshot.data();
            return [{ id: Snapshot.id, ...data }];
        } else return null;
    }

    async UpdateDocument(DocumentId, DocumentData) {
        if (!this.Collection) return;
        const DocRef = Firestore.doc(Db, this.Collection, DocumentId);
        await Firestore.updateDoc(DocRef, DocumentData);
    }

    async DeleteDocument(DocumentId) {
        if (!this.Collection) return;
        const DocRef = Firestore.doc(Db, this.Collection, DocumentId);
        await Firestore.deleteDoc(DocRef);
    }

    async GetDocuments(Query = {}) {
        if (!this.Collection) return;
        const CollectionRef = Firestore.collection(Db, this.Collection);
        let QueryRef = CollectionRef;
        Object.entries(Query).forEach(([Key, Value]) => {
            QueryRef = Firestore.query(QueryRef, Firestore.where(Key, "==", Value));
        });
        const QuerySnapshot = await Firestore.getDocs(QueryRef);
        return QuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async GetDocumentsByField(FieldName, FieldValue) {
        if (!this.Collection) return;
        const QueryRef = Firestore.query(
            Firestore.collection(Db, this.Collection),
            Firestore.where(FieldName, "==", FieldValue)
        );
        const QuerySnapshot = await Firestore.getDocs(QueryRef);
        return QuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async GetDocumentByFieldIncludes(FieldName, FieldValue) {
        if (!this.Collection) return;
        const QueryRef = Firestore.query(
            Firestore.collection(Db, this.Collection),
            Firestore.where(FieldName, ">=", FieldValue)
        );
        const QuerySnapshot = await Firestore.getDocs(QueryRef);
        return QuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    OnSnapshot(Callback) {
        if (!this.Collection) return;
        const CollectionRef = Firestore.collection(Db, this.Collection);
        Firestore.onSnapshot(CollectionRef, (Snapshot) => {
            Callback(Snapshot);
        });
    }
}

export class Prompt {
    constructor(Prompt = { Title: "", Nodes: [] }, Style = ["", {}]) {
        this.Title = Prompt.Title;
        this.Nodes = Prompt.Nodes;
        this.Style = Style;
        this.Prompt = null;
    }

    Append() {
        const Prompt = document.createElement("div");
        Prompt.setAttribute("class", "Prompt");
        if (this.Style[0] === undefined || this.Style[0] === "self") Object.keys(this.Style[1]).forEach(Key => Prompt.style[Key] = this.Style[1][Key]);

        Prompt.innerHTML = `
            <div class="Topbar">
                <span>${this.Title}</span>
                <span button>X</span>
            </div>
            <div class="Content"></div>
        `;

        document.body.appendChild(Prompt);
        this.Prompt = Prompt;

        Prompt.setAttribute("style", `
            position: absolute;
            left: ${window.innerWidth / 2}px;
            top: ${window.innerHeight / 2}px;
        `);

        this.Style[0] ? this.Style[0] !== "self" ? Object.keys(this.Style[1]).forEach(Key => Prompt.querySelector(this.Style[0]).style[Key] = this.Style[1][Key]) : "" : "";
        Prompt.querySelector("span[button]").addEventListener("click", () => Prompt.remove());

        this.Nodes.forEach(Node => {
            if (!(Node instanceof HTMLElement)) return;
            this.Prompt.querySelector(".Content").appendChild(Node);
        });

        let Dragging = false;
        let StartX = 0;
        let StartY = 0;

        Prompt.querySelector(".Topbar").addEventListener("mousedown", (Event) => {
            Dragging = true;
            StartX = Event.clientX - parseInt(Prompt.style.left);
            StartY = Event.clientY - parseInt(Prompt.style.top);
        });

        document.addEventListener("mousemove", (Event) => {
            if (!Dragging) return;
            Prompt.style.left = `${Event.clientX - StartX}px`;
            Prompt.style.top = `${Event.clientY - StartY}px`;
        });

        document.addEventListener("mouseup", () => Dragging = false);

        return Prompt;
    }

    Remove() {
        if (!this.Prompt) return;
        this.Prompt.remove();
    }
}

Element.prototype.WaitForChild = function (Selector, Timeout = 5000) {
    return new Promise((Resolve, Reject) => {
        let Element = this.querySelector(Selector);
        if (Element) return Resolve(Element);

        let Observer = new MutationObserver(() => {
            Element = this.querySelector(Selector);
            if (Element) {
                Observer.disconnect();
                Resolve(Element);
            }
        });

        Observer.observe(this, { childList: true, subtree: true });

        setTimeout(() => {
            Observer.disconnect();
            Reject(new Error(`WaitForChild: '${Selector}' not found within ${Timeout}ms`));
        }, Timeout);
    });
};

Element.prototype.FindFirstChild = function (Selector) {
    return this.querySelector(Selector) || null;
};

export const GenerateNationName = () => {
    const Syllables1 = ["Ta", "Ka", "Ri", "Mo", "Lu", "Za", "Vo", "Si", "Ra", "La", "Di"];
    const Syllables2 = ["nara", "mar", "dor", "na", "la", "lum", "tara", "vis", "sel", "dia", "lan"];
    const Syllables3 = ["ria", "thor", "lus", "nor", "len", "do", "sha", "dor", "thar", "ka", "ren"];

    const RandomSyllable = (Array) => Array[Math.floor(Math.random() * Array.length)];

    const Part1 = RandomSyllable(Syllables1);
    const Part2 = RandomSyllable(Syllables2);
    const Part3 = RandomSyllable(Syllables3);

    const NationName = `${Part1}${Part2}${Part3}`;
    return NationName;
};

export const InvertColor = (R, G, B, Bw) => {
    if (Bw) {
        return (R * 0.299 + G * 0.587 + B * 0.114) > 186
            ? 'rgb(0, 0, 0)'
            : 'rgb(255, 255, 255)';
    }

    R = 255 - R;
    G = 255 - G;
    B = 255 - B;

    return `rgb(${R}, ${G}, ${B})`;
}