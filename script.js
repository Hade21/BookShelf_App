const finishedCheck = document.querySelector("#read");
const submitButton = document.querySelector("#submit-button");
const submitForm = document.querySelector("#form-input");
const namaBuku = document.querySelector("#nama");
const pengarangBuku = document.querySelector("#pengarang");
const tahunBuku = document.querySelector("#tahun");
const listBuku = [];
const RENDER_LIST = "render-list";
const SAVED_LIST = "saved-list";
const STORAGE_KEY = "list-buku";
const blur = document.querySelector("header");
const blur2 = document.querySelectorAll("section");
const searchInput = document.querySelector(".searchInput");
const searchButton = document.querySelector(".searchButton");

finishedCheck.addEventListener("click", function() {
    if (finishedCheck.checked) {
        submitButton.innerText = "MASUKKAN BUKU KE RAK SELESAI BACA";
    } else {
        submitButton.innerText = "MASUKKAN BUKU KE RAK BELUM SELESAI BACA";
    }
});

function generateId() {
    return +new Date();
}

function generateBook(id, nama, pengarang, tahun, sudahBaca) {
    return {
        id,
        nama,
        pengarang,
        tahun,
        sudahBaca,
    }
}

function addItem() {
    const generateID = generateId();
    const judul = namaBuku.value;
    const penulis = pengarangBuku.value;
    const terbit = tahunBuku.value;
    const itemBaru = generateBook(generateID, judul, penulis, terbit, finishedCheck.checked);

    listBuku.push(itemBaru);
    document.dispatchEvent(new Event(RENDER_LIST));
    saveToLocal();
}

function addBook(buku) {
    const title = document.createElement("h3");
    title.innerText = buku.nama;
    const pengarang = document.createElement("p");
    pengarang.innerText = "Penulis: " + buku.pengarang;
    const tahun = document.createElement("p");
    tahun.innerText = "Terbit: " + buku.tahun;

    const textWrapper = document.createElement("div");
    textWrapper.append(title, pengarang, tahun);
    const wrapper = document.createElement("div");
    wrapper.classList.add("card");
    wrapper.append(textWrapper);

    if (buku.sudahBaca) {
        const undo = document.createElement("button");
        undo.classList.add("green");
        undo.innerText = "Tandai Belum Selesai";
        undo.addEventListener("click", function() {
            tandaiBelumSelesai(buku.id);
        })

        const remove = document.createElement("button");
        remove.classList.add("red");
        remove.innerText = "Hapus Buku";
        remove.addEventListener("click", function() {
            dialogBox(buku.id);
        })

        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("card-button")
        buttonWrapper.append(undo, remove);
        wrapper.append(buttonWrapper);
    } else {
        const markDone = document.createElement("button");
        markDone.classList.add("green");
        markDone.innerText = "Tandai Sudah Selesai";
        markDone.addEventListener("click", function() {
            tandaiSudahSelsai(buku.id);
        })

        const remove = document.createElement("button");
        remove.classList.add("red")
        remove.innerText = "Hapus Buku";
        remove.addEventListener("click", function() {
            dialogBox(buku.id);
        })

        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("card-button")
        buttonWrapper.append(markDone, remove);
        wrapper.append(buttonWrapper);
    }

    return wrapper;
}

function findBookId(bukuId) {
    for (book of listBuku) {
        if (book.id == bukuId) {
            return book;
        }
    }
    return null;
}

function tandaiSudahSelsai(bukuId) {
    const target = findBookId(bukuId);
    if (target.id == null) return;

    target.sudahBaca = true;
    document.dispatchEvent(new Event(RENDER_LIST));
    saveToLocal();
}

function tandaiBelumSelesai(bukuId) {
    const target = findBookId(bukuId);
    if (target.id == null) return;

    target.sudahBaca = false;
    document.dispatchEvent(new Event(RENDER_LIST));
    saveToLocal();
}

function hapusBuku(bukuId) {
    const index = findBookIndex(bukuId);
    if (index === -1) return;

    listBuku.splice(index, 1);
    document.dispatchEvent(new Event(RENDER_LIST));
    saveToLocal();
}

function findBookIndex(bukuId) {
    for (i in listBuku) {
        if (listBuku[i].id == bukuId) {
            return i;
        }
    }
    return -1;
}

document.addEventListener("DOMContentLoaded", function() {
    submitForm.addEventListener("submit", function(event) {
        event.preventDefault();
        addItem();
    })
    if (checkStorage()) {
        loadList();
    }
})

document.addEventListener(RENDER_LIST, function() {
    const unfinished = document.querySelector(".unfinished");
    unfinished.innerHTML = "";

    const finished = document.querySelector(".finished");
    finished.innerHTML = "";

    for (item of listBuku) {
        const itemBuku = addBook(item);
        if (item.sudahBaca == false) {
            unfinished.append(itemBuku);
        } else {
            finished.append(itemBuku);
        }
    }
})

function checkStorage() {
    return typeof(Storage) !== "undefined";
}

function saveToLocal() {
    const parsed = JSON.stringify(listBuku);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_LIST));
}

function loadList() {
    const daftar = localStorage.getItem(STORAGE_KEY);
    let items = JSON.parse(daftar);
    if (items != null) {
        for (item of items) {
            listBuku.push(item);
        }
    }
    document.dispatchEvent(new Event(RENDER_LIST));
}

function dialogBox(buku) {
    const dialog = document.querySelector(".dialog-box");
    dialog.removeAttribute("hidden");
    blur.classList.add("blur");
    for (item of blur2) {
        item.classList.add("blur");
    }
    dialog.addEventListener("click", function(event) {
        if (event.target.className == "cancel") {
            dialog.setAttribute("hidden", true);
            blur.classList.remove("blur");
            for (item of blur2) {
                item.classList.remove("blur");
            }
        } else if (event.target.className == "yakin") {
            dialog.setAttribute("hidden", true);
            showSuccess(buku);
        }
    })
}

function showSuccess(buku) {
    const sukses = document.querySelector(".sukses-box");
    sukses.removeAttribute("hidden");
    setTimeout(function() {
        sukses.setAttribute("hidden", true);
        blur.classList.remove("blur");
        for (item of blur2) {
            item.classList.remove("blur");
        }
        hapusBuku(buku);
    }, 1000)
}

searchButton.addEventListener("click", function() {
    searchBook(searchInput.value);
})

function searchBook(bookName) {
    const daftar = localStorage.getItem(STORAGE_KEY);
    const list = JSON.parse(daftar);
    for (item of list) {
        if (item.nama == bookName) {
            const unfinished = document.querySelector(".unfinished");
            unfinished.innerHTML = "";

            const finished = document.querySelector(".finished");
            finished.innerHTML = "";

            const itemBuku = addBook(item);
            if (item.sudahBaca == false) {
                unfinished.append(itemBuku);
            } else {
                finished.append(itemBuku);
            }
            return;
        } else {
            const unfinished = document.querySelector(".unfinished");
            unfinished.innerHTML = "";

            const finished = document.querySelector(".finished");
            finished.innerHTML = "";
        }
    }
}
