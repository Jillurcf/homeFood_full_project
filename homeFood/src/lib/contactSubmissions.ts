import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ContactSubmission {
  name: string;
  email: string;
  mobile: string;
  topic: string;
  message: string;
  createdAt: string;
}

const STORAGE_KEY = "homefood:contact-submissions";

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContactSubmission[]) : [];
  } catch {
    return [];
  }
}

export async function saveContactSubmission(
  input: Omit<ContactSubmission, "createdAt">,
): Promise<ContactSubmission> {
  const submission: ContactSubmission = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  const existing = await getContactSubmissions();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([submission, ...existing]),
  );

  return submission;
}
