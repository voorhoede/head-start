import { PUBLIC_IS_PRODUCTION, } from 'astro:env/server';
import { type FieldType, isValidFieldType } from '~/components/FormField/fieldTypes';
import { z } from 'astro:schema';
import { type CollectionEntry } from '~/lib/content';
import { t } from '~/lib/i18n';
import { turnstileChallenge } from '~/lib/forms';

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
    phone: z
      .string()
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        t('field_valid_phone', { field: field.label }) ||
        'Vul een geldig telefoonnummer in',
      ),
    select: z.string(),
    radio: z.string(),
    checkbox: z.string(),
    number: z
      .string()
      .regex(
        /^\d+(\.\d+)?$/,
        t('field_valid_number', { field: field.label }) ||
        'Vul een geldig getal in',
      ),
    date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        t('field_valid_date', { field: field.label }) ||
        'Vul een geldige datum in',
      ),
  } satisfies Record<FieldType, z.ZodTypeAny>;
  return schemas[fieldType] || z.string();
};

export default async function <T extends Form>({
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

  const checkboxFields = new Set(
    form.formFields
      .filter((f) => f.fieldType === 'checkbox')
      .map((f) => f.name),
  );

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

    // Checkbox groups submit multiple values for the same name — collect them all.
    // Always set the key (empty string when nothing checked) so nonempty() fires with the right message.
    for (const name of checkboxFields) {
      const values = formData.getAll(name).filter((v): v is string => typeof v === 'string');
      formValues[name] = values.join(', ');
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
