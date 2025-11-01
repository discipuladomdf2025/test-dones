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

  // 🔹 Primero guardamos en Firebase
  const registro = {
    nombre,
    correo,
    telefono,
    fecha: new Date().toISOString(),
    resultados: {}
  };

  resultados.forEach(r => {
    const claveSegura = r.nombre.replace(/[.#$/[\]]/g, "_");
    registro.resultados[claveSegura] = r.total;
  });

  // ⬇️ Guardar en Firebase y luego asegurarnos de que los correos terminen
  firebase.database().ref("respuestas").push(registro)
    .then(() => {
      console.log("✅ Datos guardados en Firebase");
      // Esperar envíos de ambos correos ANTES de redirigir
      return Promise.all([
        emailjs.send("service_m7i35iw", "template_3hymrgx", paramsAdmin),
        emailjs.send("service_m7i35iw", "template_kh5rb49", paramsUsuario)
      ]);
    })
    .then(() => {
      console.log("✅ Correos enviados (admin + usuario)");
      // Ahora sí redirigir cuando todo se completó
      const cuerpoTexto = resultados.map(r => `${r.nombre}: ${r.total}`).join("\n");
      localStorage.setItem("ultimo_resultado", JSON.stringify({ resultados: cuerpoTexto }));
      window.location.href = "gracias.html";
    })
    .catch(err => {
      console.error("❌ Error durante el proceso:", err);
      alert("⚠️ Hubo un problema al enviar los correos. Tus datos se guardaron correctamente.");
    });
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
  const preguntasDiv = document.getElementById("preguntas");
  preguntasDiv.innerHTML = data.preguntas.map(crearHTMLPregunta).join("");

  
// ✅ Escuchar click en el botón "Ver y Enviar Resultados"
document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  // Validaciones
  if (!nombre || !correo || !telefono) {
    alert("⚠️ Por favor, completa tu nombre, correo y teléfono antes de enviar el test.");
    return;
  }

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoValido.test(correo)) {
    alert("⚠️ Por favor, ingresa un correo electrónico válido.");
    return;
  }

  const formData = new FormData(document.getElementById("info-form"));
  const respuestas = document.querySelectorAll(".question input[type='radio']:checked");

  // Agregar respuestas al formData
  respuestas.forEach(input => {
    formData.append(input.name, input.value);
  });

  const resultados = calcularResultados(data, formData);

  // ✅ Enviar una sola vez
  const boton = document.getElementById("submit");
  boton.disabled = true;
  enviarResultados(nombre, correo, telefono, resultados);

  // Rehabilitar botón tras 3s
  setTimeout(() => boton.disabled = false, 3000);
});
}
document.addEventListener("DOMContentLoaded", () => {
  iniciar();
});





