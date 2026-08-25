import { el } from "./ui.js";

export function heroPortrait(child, className = "hero-avatar") {
  return child.photo
    ? el("img", { class: `${className} hero-photo`, src: child.photo, alt: "" })
    : el("span", { class: className, text: child.avatar || "🦸" });
}

export function choosePhotoInput(label, onPhoto) {
  const input = el("input", {
    type: "file",
    accept: "image/*",
    capture: "user",
    class: "profile-photo-input",
    "aria-label": label,
  });
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    const photo = await resizePhoto(file);
    await onPhoto(photo);
    input.value = "";
  });
  return input;
}

async function resizePhoto(file) {
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const item = new Image();
    item.onload = () => resolve(item);
    item.onerror = reject;
    item.src = source;
  });
  const size = 480;
  const scale = Math.max(size / image.width, size / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
