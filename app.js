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

function mostrarResultados(resultados) {
  const contenedor = document.getElementById("results");
  contenedor.innerHTML = "<h2>Resultados</h2>";
  resultados.forEach(r => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${r.nombre}:</strong> ${r.total} <br><small>${r.descripcion}</small>`;
    contenedor.appendChild(div);
  });
}

function enviarResultados(nombre, correo, telefono, resultados) {
  const cuerpo = resultados.map(r => `${r.nombre}: ${r.total}`).join("\n");

  const paramsAdmin = {
    nombre,
    correo,
    telefono,
    resultados: cuerpo
  };

  const paramsUsuario = {
    nombre,
    correo,
    resultados: cuerpo
  };

  // Enviar al admin primero
  emailjs.send("service_m7i35iw", "template_3hymrgx", paramsAdmin)
    .then(() => {
      console.log("✅ Correo enviado al admin");

      // Luego al usuario
      return emailjs.send("service_m7i35iw", "template_kh5rb49", paramsUsuario);
    })
    .then(() => {
      console.log("✅ Correo enviado al usuario");

      // Guardar en Sheets
      guardarEnGoogleSheets(nombre, correo, telefono, resultados);

      // Guardar resultados y redirigir
      localStorage.setItem("ultimo_resultado", JSON.stringify({ resultados: cuerpo }));
      window.location.href = "gracias.html";
    })
    .catch(error => {
      console.error("❌ Error al enviar correos:", error);
      alert("Error al enviar los correos: " + JSON.stringify(error));
    });
}




async function iniciar() {
  const data = await loadPreguntas();
  const form = document.getElementById("test-form");
  form.innerHTML = data.preguntas.map(crearHTMLPregunta).join("");

  document.getElementById("submit").addEventListener("click", (e) => {
    e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
    
  // Validar campos vacíos
  if (!nombre || !correo || !telefono) {
    alert("⚠️ Por favor, completa tu nombre, correo y teléfono antes de enviar el test.");
    return;
  }

  // Validar formato de correo
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoValido.test(correo)) {
    alert("⚠️ Por favor, ingresa un correo electrónico válido.");
    return;
  }
    
    const formData = new FormData(form);
    const resultados = calcularResultados(data, formData);
    //mostrarResultados(resultados);
    


enviarResultados(nombre, correo, telefono, resultados);

  });
}

iniciar();

function guardarEnGoogleSheets(nombre, correo, telefono, resultados) {
  const cuerpo = resultados.map(r => `${r.nombre}: ${r.total}`).join("\n");

  fetch("https://script.google.com/macros/s/AKfycbzV_kpDZ7AhWWaj72PIzWScv4nBzK6FfusJGwHC61rdNcGSmowiWisvA-gm34fYuWIQvQ/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // 🔹 importante: JSON
    body: JSON.stringify({
      nombre,
      correo,
      telefono,
      resultados: cuerpo
    })
  })
  .then(res => res.text())
  .then(txt => {
    if (txt === "OK") {
      console.log("✅ Resultados guardados correctamente en Google Sheets");
    } else {
      console.error("⚠️ Respuesta inesperada del script:", txt);
    }
  })
  .catch(err => console.error("❌ Error al guardar en Sheets:", err));
}














