import { PUBLIC_IS_PRODUCTION, } from 'astro:env/server';
import { type FieldType, isValidFieldType } from '~/components/FormField/fieldTypes';
import { z } from 'astro:schema';
import { type CollectionEntry } from '~/lib/content';
import { t } from '~/lib/i18n';
import { turnstileChallenge } from '~/lib/forms';

type Form = CollectionEntry<'Forms'>['data'];

export type ValidationResult = {
  success: boolean;
  values: Record<string, string>;
  errors: Record<string, string>;
};

export type FormActionHandler = (
  result: ValidationResult,
  partial: boolean,
) => Promise<Response>;

const fieldMessage = (field: Form['formFields'][number]) =>
  t('field_invalid', { field: field.name });

const createFieldSchema = (field: Form['formFields'][number]) => {
  const fieldType = isValidFieldType(field.fieldType)
    ? field.fieldType
    : ('text' as FieldType);
  const msg = fieldMessage(field);
  const schemas = {
    email: z.string().email(msg),
    text: z.string(),
    textarea: z.string(),
    phone: z.string().regex(/^[0-9+() ]+$/, msg),
    select: z.string(),
    radio: z.string(),
    checkbox: z.string(),
    number: z.string().regex(/^\d+(\.\d+)?$/, msg),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg),
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
}): Promise<ValidationResult> {
  const formValues: Record<string, string> = {};
  const _attachmentValues: Record<string, Record<string, File>> = {};
  let formErrors: Record<string, string> = {};

  if (
    PUBLIC_IS_PRODUCTION &&
    !(await turnstileChallenge(formData, requestHeaders))
  ) {
    console.error('Turnstile verification failed');
    formErrors['turnstileError'] = 'Verification failed, please try again';
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
          fieldMessage(field),
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
        _attachmentValues[field] = {
          ..._attachmentValues[field],
          [value.name]: value
        };
        formValues[field] = `${formValues[field] ? `${formValues[field]}, ${value.name}` : value.name}`;
      }

      if (typeof value === 'string') {
        formValues[field] = value;
      }
    }

    // Checkbox groups submit multiple values for the same name so we get them all.
    for (const name of checkboxFields) {
      const values = formData.getAll(name).filter((v): v is string => typeof v === 'string');
      formValues[name] = values.join(', ');
    }

    // Seed empty string so required fields fire nonempty()
    for (const field of form.formFields) {
      if (!(field.name in formValues)) formValues[field.name] = '';
    }

    formSchema.parse(formValues);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      formErrors = {
        ...formErrors,
        ...Object.fromEntries(
          error.errors.map(({ path, message }) => [path[0], message]),
        ),
      };
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
