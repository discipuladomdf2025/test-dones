async function loadPreguntas() {
  const res = await fetch("questions.json");
  return await res.json();
}

function crearHTMLPregunta(q) {
  return `
    <div class="question">
      <p><strong>${q.id}.</strong> ${q.texto}</p>
      <label><input type="radio" name="q${q.id}" value="0" required> 0</label>
      <label><input type="radio" name="q${q.id}" value="1"> 1</label>
      <label><input type="radio" name="q${q.id}" value="2"> 2</label>
    </div>
  `;
}

function calcularResultados(data, formData) {
  const resultados = {};
  for (const grupo of data.grupos) resultados[grupo.id] = 0;

  for (const p of data.preguntas) {
    const val = parseInt(formData.get(`q${p.id}`)) || 0;
    resultados[p.grupo] += val;
  }

  return Object.entries(resultados)
    .map(([id, total]) => {
      const grupo = data.grupos.find(g => g.id === id);
      return { nombre: grupo.id, descripcion: grupo.descripcion, total };
    })
    .sort((a, b) => b.total - a.total);
}

function enviarResultados(nombre, correo, telefono, resultados) {
  const cuerpo = resultados.map(r => `${r.nombre}: ${r.total}`).join("\n");

  const paramsAdmin = { nombre, correo, telefono, resultados: cuerpo };
  const paramsUsuario = { nombre, correo, resultados: cuerpo };

  // EmailJS (admin)
  emailjs.send("service_m7i35iw", "template_3hymrgx", paramsAdmin)
    .then(() => console.log("✅ Correo enviado al admin"))
    .catch(err => console.error("❌ Error al enviar al admin:", err));

  // EmailJS (usuario)
  emailjs.send("service_m7i35iw", "template_kh5rb49", paramsUsuario)
    .then(() => console.log("✅ Correo enviado al usuario"))
    .catch(err => console.error("❌ Error al enviar al usuario:", err));

  // Firebase
  guardarEnFirebase(nombre, correo, telefono, resultados);

  // LocalStorage y redirección
  const cuerpoTexto = resultados.map(r => `${r.nombre}: ${r.total}`).join("\n");
  localStorage.setItem("ultimo_resultado", JSON.stringify({ resultados: cuerpoTexto }));
  window.location.href = "gracias.html";
}

function guardarEnFirebase(nombre, correo, telefono, resultados) {
  try {
    const registro = {
      nombre,
      correo,
      telefono,
      fecha: new Date().toISOString(),
      resultados: {}
    };

    // 🔹 Reemplazar caracteres prohibidos en las claves
    resultados.forEach(r => {
      const claveSegura = r.nombre.replace(/[.#$/[\]]/g, "_");
      registro.resultados[claveSegura] = r.total;
    });

    firebase.database().ref("respuestas").push(registro)
      .then(() => console.log("✅ Datos guardados en Firebase"))
      .catch(err => console.error("❌ Error al guardar en Firebase:", err));

  } catch (error) {
    console.error("🔥 Error general en guardarEnFirebase:", error);
  }
}

async function iniciar() {
  const data = await loadPreguntas();

  // Renderizar preguntas dentro de #test-form
  const testForm = document.getElementById("test-form");
  testForm.innerHTML = data.preguntas.map(crearHTMLPregunta).join("");

  // El botón está fuera de los forms → usar click del botón
  const btn = document.getElementById("submit");

let enviando = false; // ✅ evita doble clic o doble envío

btn.addEventListener("click", (e) => {
  e.preventDefault();

  if (enviando) return; // si ya se está enviando, no repite
  enviando = true;

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (!nombre || !correo || !telefono) {
    alert("⚠️ Por favor, completa tu nombre, correo y teléfono antes de enviar el test.");
    enviando = false;
    return;
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoValido.test(correo)) {
    alert("⚠️ Por favor, ingresa un correo electrónico válido.");
    enviando = false;
    return;
  }

  const formData = new FormData(testForm);
  const resultados = calcularResultados(data, formData);

  // 🔹 Enviar resultados
  enviarResultados(nombre, correo, telefono, resultados);

  // 🔹 Evitar doble envío por toque prolongado en móvil
  setTimeout(() => enviando = false, 4000);
});
}

iniciar();


