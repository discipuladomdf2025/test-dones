# 🕊️ Test de Dones Espirituales – Mundo de Fe Costa Rica

Aplicación web interactiva para evaluar los dones espirituales, desarrollada para el ministerio **Mundo de Fe Costa Rica**.  
Permite a los usuarios responder un conjunto de preguntas, obtener un resultado personalizado y enviarlo por correo electrónico al ministerio, mientras se almacena automáticamente una copia en Google Sheets.

---

## 🚀 Funcionalidades principales

- Formulario dinámico generado desde un archivo JSON (`questions.json`).
- Evaluación automática según el nivel de afinidad (0, 1 o 2).
- Envío de resultados vía **EmailJS**:
  - Copia al participante.
  - Copia al ministerio.
- Almacenamiento seguro de los resultados en **Google Sheets** mediante un **Google Apps Script**.
- Página de agradecimiento personalizada (`gracias.html`) al finalizar el test.
- Diseño moderno y responsivo adaptado para **PC y dispositivos móviles**.
- Colores y estilo visual basados en la identidad institucional de *Mundo de Fe Costa Rica*.

---

## 🧩 Estructura del proyecto

```
📁 test-dones/
│
├── index.html              # Página principal con el formulario del test
├── gracias.html            # Página de agradecimiento con los resultados
├── app.js                  # Lógica principal (EmailJS + Google Sheets)
├── questions.json          # Base de datos de preguntas y grupos de dones
├── styles.css              # Estilos generales (azul institucional)
└── /assets/logo.jpg        # Logo de la iglesia
```

---

## 🛠️ Tecnologías utilizadas

- **HTML5 / CSS3 / JavaScript (Vanilla)**
- **EmailJS** → envío automático de correos sin backend.
- **Google Apps Script + Google Sheets** → almacenamiento de resultados.
- **GitHub Pages** → hosting gratuito y accesible públicamente.

---

## 📦 Despliegue

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/discipuladomdf2025/test-dones.git
   ```

2. Abrir `index.html` o acceder directamente a la versión publicada en GitHub Pages:
   ```
   https://discipuladomdf2025.github.io/test-dones/
   ```

3. (Opcional) Personalizar:
   - Reemplazar el correo del ministerio en `app.js`.
   - Ajustar el color principal en `styles.css`.

---

## ⚙️ Configuración de EmailJS

1. Crear una cuenta en [https://www.emailjs.com](https://www.emailjs.com).  
2. Obtener los datos:
   - **Service ID**
   - **Template ID**
   - **Public Key**
3. Reemplazarlos dentro del archivo `app.js` en la sección:
   ```js
   emailjs.send("service_ID", "template_ID", paramsAdmin);
   ```

---

## 🧾 Configuración de Google Sheets

1. Crear una nueva hoja en Google Sheets con las columnas:
   ```
   Nombre | Correo | Teléfono | Resultados | Fecha
   ```
2. Ir a **Extensiones → Apps Script** y pegar:
   ```js
   function doPost(e) {
     var hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     hoja.appendRow([data.nombre, data.correo, data.telefono, data.resultados, new Date()]);
     return ContentService.createTextOutput("OK");
   }
   ```
3. Desplegar como **Web App**:
   - “Ejecutar como”: *Me*
   - “Acceso”: *Cualquiera con el enlace*
4. Copiar el enlace que termina en `/exec` y reemplazarlo en `app.js`.

---

## 👥 Créditos

- Desarrollado por **Gabriel Sanabria** para **Mundo de Fe Costa Rica**.  
- Inspirado en el deseo de ayudar a los creyentes a descubrir sus dones y áreas de servicio dentro de la iglesia.

---

## 📄 Licencia

Proyecto de uso interno del ministerio.  
Se permite su reproducción, uso o adaptación con fines ministeriales o educativos, **no comerciales**.
