let stream = null;
let captured = null;
let last = null;

const imageInput = document.getElementById("imageInput");
const result = document.getElementById("result");
const cameraBox = document.getElementById("cameraBox");
const camera = document.getElementById("camera");

// Camera
function openCamera() {
    cameraBox.classList.remove("hidden");

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(s) {
            stream = s;
            camera.srcObject = s;
        })
        .catch(function() {
            alert("Camera access denied");
        });
}

function capture() {
    const canvas = document.createElement("canvas");
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(camera, 0, 0);

    canvas.toBlob(function(blob) {
        captured = blob;
        alert("Image Captured");
    });

    stream.getTracks().forEach(function(t) {
        t.stop();
    });

    cameraBox.classList.add("hidden");
}

// Analyze
function analyze() {

    const fd = new FormData();

    if (captured) {
        fd.append("image", captured, "camera.jpg");
    } else if (imageInput.files[0]) {
        fd.append("image", imageInput.files[0]);
    } else {
        alert("Upload or capture an image");
        return;
    }

    result.innerHTML = "🔍 Analyzing...";

    fetch("/predict", {
            method: "POST",
            body: fd
        })
        .then(r => r.json())
        .then(d => {

            if (d.error) {
                result.innerHTML = "⚠️ " + d.error;
                return;
            }

            last = d;

            let riskColor = "green";
            if (d.risk === "High") riskColor = "red";
            if (d.risk === "Medium") riskColor = "orange";

            result.innerHTML =
                "<h3>" + d.decision + "</h3>" +
                "<p><b>Predicted Class:</b> " + d.class + "</p>" +
                "<p><b>Confidence:</b> " + d.confidence + "%</p>" +
                "<p><b>Cancer Probability:</b> " + d.cancer_probability + "%</p>" +

                "<div style='margin:10px 0;'>" +
                "<span style='padding:6px 12px;border-radius:20px;background:" + riskColor + ";color:white;font-weight:bold;'>" +
                d.risk + " Risk</span></div>" +

                "<div class='bar'>" +
                "<div class='fill' style='width:" + d.confidence + "%'></div></div>" +

                "<h4 style='margin-top:20px;'>AI Heatmap</h4>" +
                "<img src='" + d.heatmap + "?t=" + new Date().getTime() +
                "' style='width:100%;border-radius:12px;margin-top:10px;'>";
        })
        .catch(() => {
            result.innerHTML = "⚠️ Analysis failed";
        });
}

// Download PDF
function download() {

    if (!last) {
        alert("Analyze image first");
        return;
    }

    last.name = document.getElementById("patientName").value;
    last.age = document.getElementById("age").value;
    last.gender = document.getElementById("gender").value;

    fetch("/generate_report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(last)
        })
        .then(r => r.blob())
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "AI_Skin_Report.pdf";
            a.click();
        });
}

// Chatbot
function toggleChat() {
    document.getElementById("chatbox").classList.toggle("hidden");
}

function sendMessage() {

    const input = document.getElementById("chatInput");
    const messages = document.getElementById("chatMessages");

    const userMsg = input.value;
    if (!userMsg) return;

    messages.innerHTML += "<div><b>You:</b> " + userMsg + "</div>";

    fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMsg })
        })
        .then(r => r.json())
        .then(d => {
            messages.innerHTML += "<div><b>AI:</b> " + d.reply + "</div>";
            messages.scrollTop = messages.scrollHeight;
        });

    input.value = "";
}