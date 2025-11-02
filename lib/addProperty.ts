export interface PropertyFormData {
  name: string;
  rent: string;
  area: string;
  yearBuilt: string;
  renovated: boolean;
  address: string;
  description: string;
}

export interface UploadResult {
  success: boolean;
  urls?: string[];
  message?: string;
}

// ---------------------------
// ✅ 1. Validation Function
// ---------------------------
export function validatePropertyForm(data: PropertyFormData): string[] {
  const errors: string[] = [];
  if (!data.name) errors.push("Unit Name is required");
  if (!data.rent || isNaN(Number(data.rent.replace(/,/g, ""))))
    errors.push("Rent must be a valid number");
  if (!data.area || isNaN(Number(data.area)))
    errors.push("Area must be a valid number");
  if (!data.yearBuilt || isNaN(Number(data.yearBuilt)))
    errors.push("Year Built must be a number");
  if (!data.address) errors.push("Address is required");
  if (!data.description) errors.push("Description is required");
  return errors;
}

// ---------------------------
// ✅ 2. File Upload Function
// ---------------------------
async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      resolve(btoa(binary));
    };
    reader.onerror = reject;
  });
}

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w\-.]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function uploadImages(
  images: File[],
  folderName: string
): Promise<UploadResult> {
  if (!images || images.length === 0) return { success: true, urls: [] };

  const imageData = await Promise.all(
    images.map(async (file, index) => ({
      name: `${Date.now()}_${index}_${sanitizeFileName(file.name)}`,
      content: await toBase64(file),
    }))
  );

  const res = await fetch("/api/upload-images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: imageData, folderName }),
  });

  return res.json();
}

// ---------------------------
// ✅ 3. Submit Property Function
// ---------------------------
export async function submitProperty(
  data: PropertyFormData,
  imageUrls: string[]
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch("/api/add-property", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, imageUrls }),
  });

  return res.json();
}

// ---------------------------
// ✅ 4. Combined Workflow Helper
// ---------------------------
export async function handleUploadAndSubmit(
  data: PropertyFormData,
  images: File[],
  setLoading: (loading: boolean) => void,
  setUploadedUrls: (urls: string[]) => void,
  resetForm: () => void
) {
  const errors = validatePropertyForm(data);
  if (errors.length) {
    alert("Please fix the following errors:\n" + errors.join("\n"));
    return;
  }

  setLoading(true);
  try {
    let imageUrls: string[] = [];

    if (images.length > 0) {
      const uploadRes = await uploadImages(images, "property-images");
      if (uploadRes.success && uploadRes.urls?.length) {
        imageUrls = uploadRes.urls;
        setUploadedUrls(uploadRes.urls);
      } else {
        alert("Image upload failed. Please check console for details.");
        return;
      }
    }

    const submitRes = await submitProperty(data, imageUrls);
    if (submitRes.success) {
      alert("Property successfully added!");
      resetForm();
    } else {
      alert(submitRes.message || "Error saving property");
    }
  } catch (err) {
    console.error("Error in upload and submit:", err);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
}