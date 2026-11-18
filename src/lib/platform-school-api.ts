export type FieldErrors = Record<string, string[]>;

export type CreatedSchoolAccount = {
  school: { name: string };
  admin: { name: string; email: string };
  temporaryPassword: string;
};

type SchoolCreationResponse = {
  error?: { message?: string; fieldErrors?: FieldErrors };
  school?: CreatedSchoolAccount['school'];
  admin?: CreatedSchoolAccount['admin'];
  temporaryPassword?: string;
};

export async function requestSchoolCreation(formData: FormData) {
  const response = await fetch('/api/platform/schools', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData.entries())),
  });
  const payload = (await response.json()) as SchoolCreationResponse;

  return { response, payload };
}
