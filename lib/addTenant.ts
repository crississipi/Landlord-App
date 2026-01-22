//lib\addTenant.ts

// ---------------------------
// ✅ 1. Type Definitions
// ---------------------------

export interface TenantFormData {
  firstName: string;
  lastName: string;
  middleInitial: string;
  sex: string;
  bday: string;
  unitNumber: string;
  propertyId: number;
  email: string;
  firstNumber: string;
  secondNumber: string;
  profileImage: File | null;
  idImages: File[];
  signature: string;
  agreedToRules: boolean;
  agreedToContract: boolean;
  signedRulesUrl?: string; // Add these
  signedContractUrl?: string; // Add these
}

export interface UploadResult {
  success: boolean;
  urls?: string[];
  message?: string;
}

function calculateAge(birthday: string): number {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// ---------------------------
// ✅ 2. Validation Function
// ---------------------------

export function validateTenantForm(data: TenantFormData): string[] {
  const errors: string[] = [];

  if (!data.firstName) errors.push("First name is required");
  if (!data.lastName) errors.push("Last name is required");
  if (!data.sex || data.sex === "Sex") errors.push("Sex is required");
  if (!data.bday) errors.push("Birthdate is required");
  if (!data.unitNumber) errors.push("Unit number is required");
  if (!data.email) errors.push("Email address is required");
  if (!data.firstNumber) errors.push("Primary contact number is required");
  if (data.idImages.length < 2) errors.push("Two valid ID images are required");

  return errors;
}

// ---------------------------
// ✅ 3. File Upload Functions
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

export async function uploadTenantImages(
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
// ✅ 4. Password Generation & Encryption
// ---------------------------

/**
 * Generates a tenant password by combining their name with 'coliving'.
 * Example: John Doe → "johndoe_coliving"
 */
export function generateTenantPassword(
  firstName: string,
  lastName: string
): string {
  const base = `${firstName}${lastName}`.replace(/\s+/g, "").toLowerCase();
  return `${base}_coliving`;
}

// ---------------------------
// ✅ 5. Submit Tenant Function
// ---------------------------

export async function submitTenant(
  data: TenantFormData & { 
    password: string;
    signedRulesUrl?: string;
    signedContractUrl?: string;
  },
  imageUrls: string[]
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch("/api/add-tenant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: data.email,
      password: data.password,
      role: "tenant",
      firstName: data.firstName,
      lastName: data.lastName,
      middleInitial: data.middleInitial,
      sex: data.sex,
      bday: new Date(data.bday),
      propertyId: data.propertyId,
      email: data.email,
      firstNumber: data.firstNumber,
      secondNumber: data.secondNumber,
      unitNumber: data.unitNumber,
      imageUrls,
      signedRulesUrl: data.signedRulesUrl, // Include document URLs
      signedContractUrl: data.signedContractUrl // Include document URLs
    }),
  });

  return res.json();
}

// ---------------------------
// ✅ 6. Combined Workflow Helper
// ---------------------------

export async function handleTenantUploadAndSubmit(
  data: TenantFormData,
  setLoading: (loading: boolean) => void,
  resetForm: () => void
) {
  const errors = validateTenantForm(data);
  if (errors.length) {
    alert("Please fix the following errors:\n" + errors.join("\n"));
    return;
  }

  setLoading(true);
  try {
    const allFiles: File[] = [
      ...(data.profileImage ? [data.profileImage] : []),
      ...data.idImages,
    ];

    const uploadRes = await uploadTenantImages(allFiles, "tenant-images");
    if (!uploadRes.success || !uploadRes.urls) {
      alert("Image upload failed. Please check console for details.");
      return;
    }

    // Generate tenant password (plain text - will be hashed by API)
    const plainPassword = generateTenantPassword(
      data.firstName,
      data.lastName
    );

    // Submit tenant data with document URLs (send plain password, API will hash it)
    const submitRes = await submitTenant(
      {
        ...data,
        password: plainPassword,
        signedRulesUrl: data.signedRulesUrl, // Pass document URLs
        signedContractUrl: data.signedContractUrl // Pass document URLs
      },
      uploadRes.urls
    );

    if (submitRes.success) {
      alert("Tenant successfully added!");
      console.log("Generated password (for record):", plainPassword);
      resetForm();
    } else {
      alert(submitRes.message || "Error saving tenant");
    }
  } catch (err) {
    console.error("Error submitting tenant:", err);
    alert("An unexpected error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
}
