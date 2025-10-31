# 🕊️ Spiritual Gifts Test – Mundo de Fe Costa Rica

Interactive web application created for **Mundo de Fe Costa Rica**, designed to help participants discover their spiritual gifts.  
Users can answer a series of questions, receive a personalized result, and automatically send it via email while saving the data to Google Sheets.

---

## 🚀 Main Features

- Dynamic question form generated from a JSON file (`questions.json`).
- Automatic scoring system (0, 1, or 2 scale).
- Result delivery via **EmailJS**:
  - Copy sent to the participant.
  - Copy sent to the ministry.
- Secure data storage in **Google Sheets** through a **Google Apps Script**.
- Personalized thank-you page (`gracias.html`) with the participant’s results.
- Responsive design compatible with both desktop and mobile devices.
- Visual identity inspired by *Mundo de Fe Costa Rica*’s institutional colors.

---

## 🧩 Project Structure

```
📁 test-dones/
│
├── index.html              # Main test page
├── gracias.html            # Thank-you page displaying results
├── app.js                  # Main logic (EmailJS + Google Sheets)
├── questions.json          # Question and category database
├── styles.css              # Global styling (blue institutional palette)
└── /assets/logo.jpg        # Church logo
```

---

## 🛠️ Technologies Used

- **HTML5 / CSS3 / Vanilla JavaScript**
- **EmailJS** → email sending without backend.
- **Google Apps Script + Google Sheets** → result storage.
- **GitHub Pages** → free hosting and public access.

---

## 📦 Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/discipuladomdf2025/test-dones.git
   ```

2. Open `index.html` or access the hosted version:
   ```
   https://discipuladomdf2025.github.io/test-dones/
   ```

3. (Optional) Customize:
   - Replace the ministry email in `app.js`.
   - Adjust color palette in `styles.css`.

---

## ⚙️ EmailJS Configuration

1. Create an account at [https://www.emailjs.com](https://www.emailjs.com).  
2. Retrieve the following:
   - **Service ID**
   - **Template ID**
   - **Public Key**
3. Replace them inside `app.js`:
   ```js
   emailjs.send("service_ID", "template_ID", paramsAdmin);
   ```

---

## 🧾 Google Sheets Configuration

1. Create a new Google Sheet with columns:
   ```
   Name | Email | Phone | Results | Date
   ```
2. Go to **Extensions → Apps Script** and paste:
   ```js
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     sheet.appendRow([data.nombre, data.correo, data.telefono, data.resultados, new Date()]);
     return ContentService.createTextOutput("OK");
   }
   ```
3. Deploy as a **Web App**:
   - “Execute as”: *Me*
   - “Who has access”: *Anyone*
4. Copy the `/exec` link and replace it in `app.js`.

---

## 👥 Credits

- Developed by **Gabriel Sanabria** for **Mundo de Fe Costa Rica**.  
- Built with the purpose of helping believers identify their gifts and calling in ministry.

---

## 📄 License

This project is intended for **ministry or educational use only**.  
Reproduction or adaptation for commercial purposes is **not allowed**.
