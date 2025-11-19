import { promises as fs } from "fs";
import path from "path";

import { EmailTemplateError } from "@src/shared/errors/EmailTemplateError";

const templateCache = new Map<string, string>();

export interface TemplateVariables {
  readonly [key: string]: string | number | boolean | undefined | null;
}

const templateRoots = [
  path.resolve(__dirname, "templates"),
  path.resolve(process.cwd(), "src/infrastructure/email/templates"),
];

async function loadTemplate(templateName: string): Promise<string> {
  for (const root of templateRoots) {
    const templatePath = path.join(root, `${templateName}.html`);

    if (templateCache.has(templatePath)) {
      return templateCache.get(templatePath)!;
    }

    try {
      const template = await fs.readFile(templatePath, "utf-8");
      templateCache.set(templatePath, template);
      return template;
    } catch (error) {
      // Continue with next root when file is not found
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw new EmailTemplateError(
          `Template '${templateName}' could not be loaded`,
          {
            cause: error,
          },
        );
      }
    }
  }

  throw new EmailTemplateError(
    `Template '${templateName}' could not be located`,
  );
}

function interpolate(template: string, variables: TemplateVariables): string {
  return template.replace(/\$\{(\w+)\}/g, (_match, key) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      return "";
    }
    return String(value);
  });
}

export async function renderTemplate(
  templateName: string,
  variables: TemplateVariables = {},
): Promise<string> {
  try {
    const template = await loadTemplate(templateName);
    return interpolate(template, variables);
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      throw error;
    }
    throw new EmailTemplateError(
      `Failed to render template '${templateName}'`,
      {
        cause: error,
      },
    );
  }
}
