// --- Importar Firebase (versión modular) ---
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getAuth, 
  setPersistence, 
  browserSessionPersistence, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

console.log("app.js cargado correctamente");

// --- Configuración de Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBSdq00vH2j95_LI2LCnu6TO7HjAl43wKg",
  authDomain: "cresana-eebb5.firebaseapp.com",
  projectId: "cresana-eebb5",
  storageBucket: "cresana-eebb5.appspot.com",
  messagingSenderId: "710515105937",
  appId: "1:710515105937:web:007b2e60e03db28d015f30"
};

// --- Inicializar Firebase ---
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Mantener sesión temporal ---
setPersistence(auth, browserSessionPersistence);

// ---------------------------------------------------------------------------
// Buscar usuario en tutores o médicos
// ---------------------------------------------------------------------------
async function buscarUsuario(uid) {
  const colecciones = ["tutores", "medicos"];
  for (const c of colecciones) {
    const ref = doc(db, c, uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...snap.data(), tipo: c === "tutores" ? "tutor" : "medico" };
    }
  }
  return null;
}


// login de usuarios
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      //Validaciones previas
      if (email === "" || password === "") {
        return Swal.fire({
          icon: "warning",
          title: "Campos vacíos",
          text: "Por favor completa todos los campos.",
          confirmButtonColor: "#0054a6"
        });
      }

      const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
        return Swal.fire({
          icon: "error",
          title: "Correo no válido",
          text: "Ingresa un correo electrónico correcto.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (password.length < 6) {
        return Swal.fire({
          icon: "error",
          title: "Contraseña inválida",
          text: "Debe tener al menos 6 caracteres.",
          confirmButtonColor: "#0054a6"
        });
      }
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userData = await buscarUsuario(user.uid);

        if (userData) {
          localStorage.setItem("nombreUsuario", userData.nombre);
          localStorage.setItem("tipoUsuario", userData.tipo);
          localStorage.setItem("telefonoTutor", userData.telefono || "");
          localStorage.setItem("uid", user.uid);

          if (userData.tipo === "tutor") {
            window.location.href = "historial.html";
          } else {
            window.location.href = "panelMedico.html";
          }
        } else {
          Swal.fire({
              icon: "error",
              title: "Usuario no encontrado",
              text: "No se encontraron datos del usuario.",
              confirmButtonColor: "#0054a6"
          });
        }
      } catch (error) {
        let mensaje = "Ocurrió un error al iniciar sesión.";
        if (error.code === "auth/invalid-email") mensaje = "Por favor, ingresa un correo válido.";
        if (error.code === "auth/user-not-found") mensaje = "El usuario no existe.";
        if (error.code === "auth/wrong-password") mensaje = "Contraseña incorrecta.";

        Swal.fire({
          icon: "error",
          title: "Ups...",
          text: mensaje,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#0054a6",
          background: "#fefefe",
          color: "#333",
          customClass: {
            popup: "swal2-rounded"}
        });
      }
    });
  }
  mostrarNombreEnInicio();
});



// ---------------------------------------------------------------------------
// REGISTRO DE USUARIOS
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const formTutor = document.getElementById("formTutor");
  const formMedico = document.getElementById("formMedico");

  const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
  const phoneRegex = /^[0-9]{10}$/;
  const nameRegex = /^[a-zA-ZÁÉÍÓÚñáéíóúÑ ]{3,40}$/;

  // ======================================================
  // 🔵 REGISTRO TUTOR
  // ======================================================
  if (formTutor) {
    formTutor.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombreTutor").value.trim();
      const email = document.getElementById("emailTutor").value.trim();
      const telefono = document.getElementById("telefonoTutor").value.trim();
      const password = document.getElementById("passwordTutor").value.trim();

      // ==== VALIDACIONES ====

      if (!nombre || !email || !telefono || !password) {
        return Swal.fire({
          icon: "warning",
          title: "Campos vacíos",
          text: "Por favor completa todos los campos.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (!nameRegex.test(nombre)) {
        return Swal.fire({
          icon: "error",
          title: "Nombre inválido",
          text: "El nombre solo puede contener letras y espacios.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (!emailRegex.test(email)) {
        return Swal.fire({
          icon: "error",
          title: "Correo no válido",
          text: "Ingresa un correo electrónico correcto.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (!phoneRegex.test(telefono)) {
        return Swal.fire({
          icon: "error",
          title: "Teléfono incorrecto",
          text: "El teléfono debe tener 10 dígitos.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (password.length < 6) {
        return Swal.fire({
          icon: "error",
          title: "Contraseña débil",
          text: "Debe tener al menos 6 caracteres.",
          confirmButtonColor: "#0054a6"
        });
      }

      // ==== INTENTAR REGISTRO ====

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        await setDoc(doc(db, "tutores", uid), {
          nombre, email, telefono,
          tipo: "tutor",
          creadoEn: serverTimestamp()
        });

        localStorage.setItem("nombreUsuario", nombre);
        localStorage.setItem("tipoUsuario", "tutor");
        localStorage.setItem("telefonoTutor", telefono);
        localStorage.setItem("uid", uid);

        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Bienvenido a CRESANA",
          confirmButtonColor: "#0054a6"
        }).then(() => {
          window.location.href = "historial.html";
        });

      } catch (error) {
        let mensaje = "Ocurrió un error al registrar.";

        if (error.code === "auth/email-already-in-use") mensaje = "Este correo ya está registrado.";
        if (error.code === "auth/invalid-email") mensaje = "Correo inválido.";
        if (error.code === "auth/weak-password") mensaje = "Contraseña demasiado débil.";

        Swal.fire({
          icon: "error",
          title: "Error",
          text: mensaje,
          confirmButtonColor: "#0054a6"
        });
      }
    });
  }

  // ======================================================
  // 🔵 REGISTRO MÉDICO
  // ======================================================
  if (formMedico) {
    formMedico.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombreMedico").value.trim();
      const email = document.getElementById("emailMedico").value.trim();
      const telefono = document.getElementById("telefonoMedico").value.trim();
      const institucion = document.getElementById("institucionMedico").value.trim();
      const password = document.getElementById("passwordMedico").value.trim();

      // ==== VALIDACIONES MÉDICO ====
      if (!nombre || !email || !telefono || !institucion || !password) {
        return Swal.fire({
          icon: "warning",
          title: "Campos vacíos",
          text: "Completa todos los campos.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (!nameRegex.test(nombre)) {
        return Swal.fire({
          icon: "error",
          title: "Nombre inválido",
          text: "El nombre solo puede contener letras y espacios.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (!emailRegex.test(email)) {
        return Swal.fire({
          icon: "error",
          title: "Correo no válido",
          text: "Ingresa un correo electrónico correcto.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (!phoneRegex.test(telefono)) {
        return Swal.fire({
          icon: "error",
          title: "Teléfono incorrecto",
          text: "Debe tener 10 dígitos.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (institucion.length < 3) {
        return Swal.fire({
          icon: "error",
          title: "Institución inválida",
          text: "Debes escribir un nombre válido de institución.",
          confirmButtonColor: "#0054a6"
        });
      }

      if (password.length < 6) {
        return Swal.fire({
          icon: "error",
          title: "Contraseña débil",
          text: "Debe tener al menos 6 caracteres.",
          confirmButtonColor: "#0054a6"
        });
      }

      // ==== INTENTAR REGISTRO ====
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        await setDoc(doc(db, "medicos", uid), {
          nombre, email, telefono, institucion,
          tipo: "medico",
          creadoEn: serverTimestamp()
        });

        localStorage.setItem("nombreUsuario", nombre);
        localStorage.setItem("tipoUsuario", "medico");
        localStorage.setItem("uid", uid);

        Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Bienvenido Doctor",
          confirmButtonColor: "#0054a6"
        }).then(() => {
          window.location.href = "panelMedico.html";
        });

      } catch (error) {
        let mensaje = "Ocurrió un error al registrar.";

        if (error.code === "auth/email-already-in-use") mensaje = "Este correo ya está registrado.";
        if (error.code === "auth/invalid-email") mensaje = "Correo inválido.";

        Swal.fire({
          icon: "error",
          title: "Error",
          text: mensaje,
          confirmButtonColor: "#0054a6"
        });
      }
    });
  }
});


// ---------------------------------------------------------------------------
// BOTONES Y SESIÓN
// ---------------------------------------------------------------------------
export async function cerrarSesion() {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
}

export function volverAlInicio() {
  window.location.href = "index.html";
}

// Mostrar nombre en inicio
function mostrarNombreEnInicio() {
  const nombre = localStorage.getItem("nombreUsuario");
  const tipo = localStorage.getItem("tipoUsuario");
  const userNameEl = document.getElementById("userName");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnHistorial = document.getElementById("historialBtn");
  const btnLogout = document.getElementById("btnLogout");

  if (nombre && tipo && userNameEl) {
    userNameEl.textContent = `Bienvenido, ${nombre}`;
    btnLogin.style.display = "none";
    btnRegister.style.display = "none";
    btnLogout.style.display = "inline-block";

    if (tipo === "tutor") {
      btnHistorial.textContent = "Ver historial de mi hijo";
      btnHistorial.style.display = "inline-block";
      btnHistorial.onclick = () => window.location.href = "historial.html";
    } else if (tipo === "medico") {
      btnHistorial.textContent = "Ir a mi panel médico";
      btnHistorial.style.display = "inline-block";
      btnHistorial.onclick = () => window.location.href = "panelMedico.html";
    } else {
      btnHistorial.style.display = "none";
    }
  } else {
    // Si no hay sesión iniciada
    if (btnLogin) btnLogin.style.display = "inline-block";
    if (btnRegister) btnRegister.style.display = "inline-block";
    if (btnHistorial) btnHistorial.style.display = "none";
    if (btnLogout) btnLogout.style.display = "none";
    if (userNameEl) userNameEl.textContent = "";
  }
}