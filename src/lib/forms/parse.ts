import { PUBLIC_IS_PRODUCTION, } from 'astro:env/server';
import { type FieldType, isValidFieldType, } from '@components/FormField/FormField.astro';
import { z } from 'astro:schema';
import { type CollectionEntry } from '@lib/content';
import { t } from '@lib/i18n';
import { turnstileChallenge } from '@lib/forms/turnstile.ts';

type Form = CollectionEntry<'Forms'>['data'];

const createFieldSchema = (field: Form['formFields'][number]) => {
  const fieldType = isValidFieldType(field.fieldType)
    ? field.fieldType
    : ('text' as FieldType);
  const schemas = {
    email: z
      .string()
      .email(
        t('field_valid_email', { field: field.label }) ||
        'Vul een geldig e-mailadres in',
      ),
    text: z.string(),
    textarea: z.string(),
    tel: z
      .string()
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        t('field_valid_phone', { field: field.label }) ||
        'Vul een geldig telefoonnummer in',
      ),
  } satisfies Record<FieldType, z.ZodTypeAny>;
  return schemas[fieldType] || z.string();
};

export async function parseFormSubmission<T extends Form>({
  form,
  formData,
  requestHeaders,
}: {
  form: T;
  formData: FormData;
  requestHeaders: Request['headers'];
}): Promise<{
  success: boolean;
  values: Record<string, string>;
  errors: Record<string, string>;
}> {
  const formValues: Record<string, string> = {};
  const attachmentValues: Record<string, Record<string, File>> = {};
  let formErrors: Record<string, string> = {};

  if (
    PUBLIC_IS_PRODUCTION &&
    formData.get('use-turnstile') &&
    !(await turnstileChallenge(formData, requestHeaders))
  ) {
    formErrors['turnstileError'] =
      t('turnstile_error') || 'Validatie mislukt, probeer het opnieuw';
  }

  const formSchema = z.object(
    form.formFields.reduce(
      (acc, field) => {
        const fieldSchema = createFieldSchema(field);
        acc[field.name] = field.required ? (fieldSchema as z.ZodString).nonempty(
          t('field_required') ||
          'Dit veld is verplicht',
        ) : fieldSchema.optional().or(z.literal(''));
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>,
    ),
  );

  try {
    for (const [field, value] of formData.entries()) {
      if (field === 'cf-turnstile-response') {
        continue; // Skip Turnstile
      }

      if (value instanceof File) {
        attachmentValues[field] = {
          ...attachmentValues[field],
          [value.name]: value
        };
        formValues[field] = `${formValues[field] ? `${formValues[field]}, ${value.name}` : value.name}`;
      }

      if (typeof value === 'string') {
        formValues[field] = value;
      }
    }

    formSchema.parse(formValues);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      formErrors = Object.fromEntries(
        error.errors.map(({ path, message }) => [path[0], message]),
      );
    } else {
      if (Object.keys(formErrors).length === 0) {
        throw error;
      }
    }
  }

  return {
    success: Object.values(formErrors).length === 0,
    values: formValues,
    errors: formErrors,
  };
}
