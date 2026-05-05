// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCWT2luJWFvyJ_DEbl6o_Df3D_I0q-DJJQ",
    authDomain: "winsports100.firebaseapp.com",
    projectId: "winsports100",
    storageBucket: "winsports100.firebasestorage.app",
    messagingSenderId: "407378833003",
    appId: "1:407378833003:web:44f28ecc70f490257a8b2e"
};

// Inicializar Firebase si no existe
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Configuración Cloudinary
const CLOUD_NAME = "diobje3nc"; 
const UPLOAD_PRESET = "wafivogu"; 

let productos = [];
let tallaSel = ""; // Variable global para la talla seleccionada

// --- LÓGICA DE INTRO Y AUDIO ---
// Reemplaza tu función actual por esta:
document.getElementById("activar-audio").onclick = () => {
    const video = document.getElementById("bg-video");
    const intro = document.getElementById("intro");
    const contenido = document.getElementById("contenido");

    // 1. Activar sonido y asegurar reproducción
    video.muted = false; 
    
    // Intentamos reproducir por si el navegador lo pausó al inicio
    const playPromise = video.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            // El video está sonando, ahora iniciamos la transición
            intro.classList.add("out");

            // 2. Detener video/audio tras la animación (800ms)
            setTimeout(() => {
                video.pause();
                video.currentTime = 0; 
                
                intro.style.display = "none";
                contenido.style.display = "block";
                
                setTimeout(() => {
                    contenido.style.opacity = "1";
                }, 50);
            }, 800); 
        }).catch(error => {
            console.log("El navegador bloqueó el inicio: ", error);
            // Si falla, al menos entramos a la tienda
            intro.classList.add("out");
        });
    }

    cargarProductos();
};

// --- GESTIÓN DE PRODUCTOS ---
function cargarProductos() {
    db.collection("productos").orderBy("fecha", "desc").onSnapshot(snap => {
        productos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarCatalogo(productos);
    });
}

function renderizarCatalogo(lista) {
    const cont = document.getElementById("catalogo");
    if (!cont) return;

    cont.innerHTML = lista.map((p) => `
        <div class="card" onclick="verProductoPorId('${p.id}')">
            <img src="${p.imagen}" alt="${p.nombre}">
            <h3>${p.nombre}</h3>
            <p>${p.precio}</p>
        </div>
    `).join('');
}

function verProductoPorId(id) {
    const p = productos.find(x => x.id === id);
    if(p) verProducto(p);
}

// --- LÓGICA DEL MODAL ---
function verProducto(p) {
    const modal = document.getElementById("modal");
    
    // Resetear selección de talla
    tallaSel = "";
    document.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('selected'));

    // Llenar información básica
    document.getElementById("modal-img").src = p.imagen;
    document.getElementById("modal-title").innerText = p.nombre;
    document.getElementById("modal-desc").innerText = p.desc || "Calidad WIN Performance.";
    document.getElementById("modal-precio").innerText = p.precio;
    
    // Galería de miniaturas (si existen más imágenes, si no usa la principal)
    const thumbs = document.getElementById("modal-thumbs");
    const imagenes = p.imagenes || [p.imagen];
    thumbs.innerHTML = imagenes.map((url, i) => `
        <img src="${url}" class="${i===0?'active':''}" onclick="actualizarImagenModal(this, '${url}')">
    `).join('');

    // Configurar botón de WhatsApp
    const tel = p.whatsapp ? p.whatsapp.replace(/\D/g,'') : "59170000000"; // Número por defecto si no hay
    const btnWsp = document.getElementById("modal-wsp");
    
    btnWsp.onclick = (e) => {
        if(!tallaSel) {
            alert("Por favor, selecciona una talla antes de continuar.");
            e.preventDefault();
            return;
        }
        const mensaje = encodeURIComponent(`¡Hola! Me interesa el producto: ${p.nombre} en talla ${tallaSel}.`);
        window.open(`https://wa.me/${tel}?text=${mensaje}`, '_blank');
    };
    
    // Mostrar modal con efecto
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("active"), 10);
    document.body.style.overflow = "hidden";
}

function actualizarImagenModal(el, url) {
    document.getElementById('modal-img').src = url;
    document.querySelectorAll('.thumbs img').forEach(img => img.classList.remove('active'));
    el.classList.add('active');
}

function cerrarModal() {
    const m = document.getElementById("modal");
    m.classList.remove("active");
    setTimeout(() => { 
        m.style.display="none"; 
        document.body.style.overflow="auto"; 
    }, 450);
}

// --- FUNCIONES DE SOPORTE ---

// Manejo de clicks en botones de talla
function selTalla(btn) {
    document.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    tallaSel = btn.innerText;
}

// Filtros de categoría
function filtrar(cat) {
    // Estilo visual de los botones de filtro
    document.querySelectorAll(".filtros button").forEach(b => {
        b.classList.toggle("active", b.innerText.toLowerCase() === cat.toLowerCase());
    });
    
    // Filtrado lógico
    const filtrados = cat === 'todos' ? productos : productos.filter(p => p.categoria === cat);
    renderizarCatalogo(filtrados);
}

// --- SESIÓN Y ADMIN (Opcional según tu flujo) ---
auth.onAuthStateChanged(user => {
    const panel = document.getElementById("admin-panel");
    if (panel) panel.style.display = user ? "block" : "none";
});